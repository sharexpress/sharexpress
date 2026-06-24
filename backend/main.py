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
from core.config import PROJECT_ENVIRONMENT

load_dotenv()


import asyncio
from controllers.file_controller import FileController, BackgroundCleaner

@asynccontextmanager
async def lifespan(app: FastAPI):
    ensure_bucket()
    await create_indexes()
    
    # Instantiate and start the BackgroundCleaner
    controller = FileController()
    cleaner = BackgroundCleaner(controller)
    cleaner_task = asyncio.create_task(cleaner.start())
    
    yield
    
    # Gracefully stop cleaner task on shutdown
    cleaner.stop()
    try:
        await asyncio.wait_for(cleaner_task, timeout=5.0)
    except asyncio.TimeoutError:
        cleaner_task.cancel()
    except Exception:
        pass


#  APP CONFIGURED

app = FastAPI(
    title="QR Authentication API",
    description="API for user authentication and QR code management",
    version="1.0.0",
    lifespan=lifespan,
)


app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["api.sharexpress.in", "*.sharexpress.in", "*"],
)

is_prod = PROJECT_ENVIRONMENT == "PRODUCTION"

app.add_middleware(
    SessionMiddleware,
    secret_key=os.getenv("SESSION_SECRET", "DEV_SECRET_CHANGE_IN_PRODUCTION"),
    same_site="none" if is_prod else "lax",
    https_only=is_prod,
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


# --- Hybrid SSR / SPA Page Router ---
from fastapi.responses import HTMLResponse
from fastapi import HTTPException

DIST_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist"))
INDEX_PATH = os.path.join(DIST_DIR, "index.html")

async def render_ssr_html():
    if not os.path.exists(INDEX_PATH):
        fallback_html = """<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <title>sharexpress files — Secure Cloud Storage & QR-Based Session Sharing</title>
</head>
<body style="background: black; color: white;">
    <h1>sharexpress files</h1>
    <p>Loading application...</p>
</body>
</html>"""
        return HTMLResponse(content=fallback_html, status_code=200)

    try:
        with open(INDEX_PATH, "r", encoding="utf-8") as f:
            html_content = f.read()
        return HTMLResponse(content=html_content, status_code=200)
    except Exception as e:
        print(f"Error serving SSR index: {str(e)}")
        if os.path.exists(INDEX_PATH):
            with open(INDEX_PATH, "r", encoding="utf-8") as f:
                return HTMLResponse(content=f.read(), status_code=200)
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/", response_class=HTMLResponse, tags=["Root"])
async def serve_ssr_index():
    return await render_ssr_html()

@app.get("/{path:path}", response_class=HTMLResponse, tags=["Root"])
async def serve_ssr_fallback(path: str):
    excluded_prefixes = ["api", "docs", "redoc", "openapi.json", "auth", "QR", "share", "files", "editor"]
    if any(path.startswith(prefix) for prefix in excluded_prefixes):
        raise HTTPException(status_code=404, detail="Not Found")
    return await render_ssr_html()


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info",
    )
