from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import timelines_router
from app.database import engine, Base

app = FastAPI(
    title="Veritas API",
    description="Real-time misinformation-free intelligence platform",
    version="0.1.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(timelines_router)


@app.on_event("startup")
async def startup():
    """Initialize database tables on startup"""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


@app.get("/")
async def root():
    return {
        "message": "Veritas API",
        "version": "0.1.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}
