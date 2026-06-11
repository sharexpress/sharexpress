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
import os
from dotenv import load_dotenv
from fastapi_mail import ConnectionConfig
from pathlib import Path

load_dotenv()


# JWT


JWT_SECRET = os.getenv("JWT_SECRET")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM")
JWT_EXPIRES = int(os.getenv("JWT_EXPIRES", 7))
PRIVATE_KEY = Path("private.pem").read_text()
PUBLIC_KEY = Path("public.pem").read_text()

# DATABASE
MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME")

# EMAILS

if os.getenv("MAIL_USERNAME") and os.getenv("MAIL_PASSWORD"):
    MAIL_CONFIG = ConnectionConfig(
        MAIL_USERNAME=os.getenv("MAIL_USERNAME"),
        MAIL_PASSWORD=os.getenv("MAIL_PASSWORD"),
        MAIL_FROM=os.getenv("MAIL_FROM") or os.getenv("MAIL_USERNAME"),
        MAIL_PORT=int(os.getenv("MAIL_PORT", 465)),
        MAIL_SERVER=os.getenv("MAIL_SERVER"),
        MAIL_STARTTLS=os.getenv("MAIL_STARTTLS", "False") == "True",
        MAIL_SSL_TLS=os.getenv("MAIL_SSL", "True") == "True",
        USE_CREDENTIALS=True,
    )
else:
    MAIL_CONFIG = None
#  GOOGLE AUTH CONFIG

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI")


#  S3 KEYS

MINIO_ENDPOINT_INTERNAL = os.getenv("MINIO_ENDPOINT_INTERNAL")
MINIO_ENDPOINT_PUBLIC = os.getenv("MINIO_ENDPOINT_PUBLIC")
MINIO_ACCESS_KEY = os.getenv("MINIO_ACCESS_KEY")
MINIO_SECRET_KEY = os.getenv("MINIO_SECRET_KEY")
MINIO_BUCKET = os.getenv("MINIO_BUCKET")
MINIO_REGION = os.getenv("MINIO_REGION", "us-east-1")


# FRONTEND CONFIG

FRONTEND_URI = os.getenv("FRONTEND_URI")


# REDIS CONFIG

REDIS_HOST = os.getenv("REDIS_HOST", None)
REDIS_PORT = os.getenv("REDIS_PORT", None)


# PROJECT ENVIRONMENT

PROJECT_ENVIRONMENT = os.getenv("PROJECT_ENVIRONMENT") or os.getenv("PORJECT_ENVIRONMET")
PORJECT_ENVIRONMET = PROJECT_ENVIRONMENT
