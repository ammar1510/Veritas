from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from datetime import datetime

from app.database import get_db
from app.models import Timeline, Event, Source, Branch
from app.schemas import TimelineCreate, TimelineResponse, TimelineStatusResponse
from app.services import GeminiService

router = APIRouter(prefix="/api/timelines", tags=["timelines"])
gemini_service = GeminiService()


def parse_datetime_naive(date_string: str) -> datetime:
    """
    Parse ISO datetime string and strip timezone info to make it naive.
    Database expects TIMESTAMP WITHOUT TIME ZONE (naive datetime).
    """
    # Replace 'Z' with '+00:00' for proper ISO parsing
    date_string = date_string.replace("Z", "+00:00")
    # Parse the datetime
    dt = datetime.fromisoformat(date_string)
    # Strip timezone to make it naive
    return dt.replace(tzinfo=None)


async def process_timeline(timeline_id: str, query: str):
    """
    Background task to process timeline generation
    Creates its own database session to avoid session closure issues
    """
    from app.database import AsyncSessionLocal

    async with AsyncSessionLocal() as db:
        try:
            # Update status to processing
            result = await db.execute(select(Timeline).where(Timeline.id == timeline_id))
            timeline = result.scalar_one()
            timeline.status = "processing"
            await db.commit()

            # Phase 1: Discover skeleton
            skeleton = await gemini_service.discover_timeline_skeleton(query)

            # Update timeline with basic info
            timeline.topic = skeleton.get("topic", query)
            if skeleton.get("date_range"):
                try:
                    timeline.date_range_start = parse_datetime_naive(
                        skeleton["date_range"]["start"]
                    )
                    timeline.date_range_end = parse_datetime_naive(
                        skeleton["date_range"]["end"]
                    )
                except (ValueError, KeyError):
                    pass

            anchor_events = skeleton.get("anchor_events", [])
            timeline.progress = f"0/{len(anchor_events)}"
            await db.commit()

            # Phase 2: Create events and investigate each
            for idx, event_data in enumerate(anchor_events):
                # Create event in database
                event = Event(
                    timeline_id=timeline_id,
                    title=event_data.get("title", "Untitled Event"),
                    event_date=parse_datetime_naive(event_data["date"]),
                    priority=event_data.get("priority", "medium"),
                    order=idx
                )
                db.add(event)
                await db.flush()

                # Investigate event with Flash subagent
                investigation = await gemini_service.investigate_event(
                    event.title,
                    event_data["date"],
                    timeline.topic
                )

                # Add sources
                for source_data in investigation.get("sources", []):
                    source = Source(
                        event_id=event.id,
                        url=source_data.get("url", ""),
                        outlet=source_data.get("outlet", "Unknown"),
                        credibility_score=source_data.get("credibility_score", 0.5),
                        publish_date=parse_datetime_naive(
                            source_data["publish_date"]
                        ) if source_data.get("publish_date") else None,
                        claims=source_data.get("claims", [])
                    )
                    db.add(source)

                # Phase 3: Detect branches
                branches_data = await gemini_service.synthesize_branches(
                    event.title,
                    investigation.get("sources", [])
                )

                for branch_data in branches_data:
                    branch = Branch(
                        event_id=event.id,
                        narrative=branch_data.get("narrative", ""),
                        credibility_score=branch_data.get("credibility_score", 0.5),
                        evidence=branch_data.get("evidence", ""),
                        source_count=branch_data.get("source_count", 0)
                    )
                    db.add(branch)

                # Update progress
                timeline.progress = f"{idx + 1}/{len(anchor_events)}"
                await db.commit()

            # Mark as completed
            timeline.status = "completed"
            await db.commit()

        except Exception as e:
            # Mark as failed
            result = await db.execute(select(Timeline).where(Timeline.id == timeline_id))
            timeline = result.scalar_one()
            timeline.status = "failed"
            await db.commit()
            raise e


@router.post("/create", response_model=TimelineStatusResponse)
async def create_timeline(
    timeline_data: TimelineCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new timeline for the given query.
    Processing happens in the background.
    """
    # Create timeline in database
    timeline = Timeline(
        query=timeline_data.query,
        topic=timeline_data.query,  # Will be updated during processing
        status="processing",
        progress="0/0"
    )
    db.add(timeline)
    await db.commit()
    await db.refresh(timeline)

    # Start background processing (don't pass db session - it will create its own)
    background_tasks.add_task(process_timeline, timeline.id, timeline_data.query)

    return TimelineStatusResponse(
        id=timeline.id,
        status=timeline.status,
        progress=timeline.progress
    )


@router.get("/{timeline_id}", response_model=TimelineResponse)
async def get_timeline(timeline_id: str, db: AsyncSession = Depends(get_db)):
    """
    Get a timeline by ID with all events, sources, and branches.
    """
    result = await db.execute(
        select(Timeline)
        .options(
            selectinload(Timeline.events)
            .selectinload(Event.sources),
            selectinload(Timeline.events)
            .selectinload(Event.branches)
            .selectinload(Branch.sources)
        )
        .where(Timeline.id == timeline_id)
    )
    timeline = result.scalar_one_or_none()

    if not timeline:
        raise HTTPException(status_code=404, detail="Timeline not found")

    return timeline


@router.get("/{timeline_id}/status", response_model=TimelineStatusResponse)
async def get_timeline_status(timeline_id: str, db: AsyncSession = Depends(get_db)):
    """
    Get the current status of a timeline.
    """
    result = await db.execute(
        select(Timeline).where(Timeline.id == timeline_id)
    )
    timeline = result.scalar_one_or_none()

    if not timeline:
        raise HTTPException(status_code=404, detail="Timeline not found")

    return TimelineStatusResponse(
        id=timeline.id,
        status=timeline.status,
        progress=timeline.progress
    )
