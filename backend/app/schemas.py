from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List


class TimelineCreate(BaseModel):
    query: str


class BranchResponse(BaseModel):
    id: str
    narrative: str
    credibility_score: float
    evidence: Optional[str]
    source_count: int

    class Config:
        from_attributes = True


class SourceResponse(BaseModel):
    id: str
    url: str
    outlet: str
    credibility_score: float
    publish_date: Optional[datetime]
    claims: List[str]

    class Config:
        from_attributes = True


class EventResponse(BaseModel):
    id: str
    title: str
    description: Optional[str]
    event_date: datetime
    priority: str
    branches: List[BranchResponse]
    sources: List[SourceResponse]

    class Config:
        from_attributes = True


class TimelineResponse(BaseModel):
    id: str
    topic: str
    query: str
    status: str
    progress: str
    date_range_start: Optional[datetime]
    date_range_end: Optional[datetime]
    created_at: datetime
    events: List[EventResponse]

    class Config:
        from_attributes = True


class TimelineStatusResponse(BaseModel):
    id: str
    status: str
    progress: str

    class Config:
        from_attributes = True
