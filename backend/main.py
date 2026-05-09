# Copyright 2026 sharexpress
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND.
#


# SOURCE FILE STARTS FROM HERE
import uvicorn
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
import os
from contextlib import asynccontextmanager
from core.indexes import create_indexes
from core.s3_config import ensure_bucket

# ROUTERS IMPORTS


from routers.sharing_session_routes import router as Sharing_session_router
from routers.user_routes import router as User_router
from routers.qr_routes import router as qr_router
from routers.file_routes import router as file_router
from routers.history_routes import router as history_router
from routers.edit_routes import router as edit_router
from starlette.middleware.trustedhost import TrustedHostMiddleware
#  ENV FILE FUNCTION LOADS


load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    ensure_bucket()
    yield


# @asynccontextmanager
# async def lifespan(app: FastAPI):
#     await create_indexes()
#     yield


#  APP CONFIGURED

app = FastAPI(
    title="QR Authentication API",
    description="API for user authentication and QR code management",
    version="1.0.0",
    # lifespan=lifespan,
)


app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["api.sharexpress.in", "*.sharexpress.in", "*"],
)

app.add_middleware(
    SessionMiddleware,
    secret_key=os.getenv("SESSION_SECRET", "DEV_SECRET_CHANGE_IN_PRODUCTION"),
    same_site="lax",
    https_only=False,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://sharexpress.in",
        "https://www.sharexpress.in",
        # Local development
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://192.168.29.104:5173",
        # Optional local backend testing
        "http://localhost:3000",
        "http://192.168.29.104:4000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)


app.add_middleware(
    SessionMiddleware,
    secret_key=os.getenv("SESSION_SECRET", "DEV_SECRET_CHANGE_IN_PRODUCTION"),
    same_site="none",
    https_only=True,
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Catch all unhandled exceptions"""
    print(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "success": False},
    )


# ROUTERS INCLUDED HERE


app.include_router(User_router)
app.include_router(qr_router)
app.include_router(Sharing_session_router)
app.include_router(file_router)
app.include_router(history_router)
app.include_router(edit_router)


# HEALTH CHECKED API


@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "success": True,
        "message": "API is running",
    }


@app.get("/", tags=["Root"])
async def root():
    """Root endpoint with API information"""
    return {
        "message": "QR Authentication API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
    }


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info",
    )
