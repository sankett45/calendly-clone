from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from django.db import IntegrityError

from fastapi_app.core.config import get_settings
from fastapi_app.core.django_setup import init_django

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # ✅ Initialize Django FIRST
    init_django(settings.django_settings_module)

    # ✅ Import routers AFTER Django setup
    from fastapi_app.routers import events, availability, bookings

    app.include_router(events.router,       prefix="/api/v1")
    app.include_router(availability.router, prefix="/api/v1")
    app.include_router(bookings.router,     prefix="/api/v1")

    yield


app = FastAPI(
    title="Calendly Clone API",
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS ─────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
   allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Global error handler ──────────────────────────────

@app.exception_handler(IntegrityError)
async def integrity_error_handler(request: Request, exc: IntegrityError):
    return JSONResponse(
        status_code=409,
        content={"detail": "Slot conflict detected. Please choose another time."},
    )


@app.get("/health")
async def health():
    return {"status": "ok"}