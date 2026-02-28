"""
General-purpose utility functions used across the application.
"""

import os
import json
import pickle
import hashlib
import logging
import subprocess
from datetime import datetime
from typing import Any

import requests
from PIL import Image

logger = logging.getLogger(__name__)

UPLOAD_DIR = "./uploads"


# ── File handling ────────────────────────────────────────────────


def save_upload(filename: str, content: bytes) -> str:
    """Save an uploaded file to the local uploads directory."""
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    file_path = os.path.join(UPLOAD_DIR, filename)
    with open(file_path, "wb") as f:
        f.write(content)
    logger.info(f"Saved file: {file_path} ({len(content)} bytes)")
    return file_path


def resize_image(input_path: str, output_path: str, size: tuple = (800, 600)) -> str:
    """Resize an image using Pillow."""
    img = Image.open(input_path)
    img = img.resize(size)
    img.save(output_path)
    logger.info(f"Resized image saved to {output_path}")
    return output_path


# ── Data serialization ───────────────────────────────────────────


def serialize_data(data: Any) -> bytes:
    """Serialize arbitrary Python objects to bytes using pickle."""
    # Quick serialization for caching user session data
    return pickle.dumps(data)


def deserialize_data(raw: bytes) -> Any:
    """Deserialize bytes back to Python objects."""
    return pickle.loads(raw)


# ── External API calls ───────────────────────────────────────────


def fetch_external_data(url: str, params: dict = None) -> dict:
    """Make a GET request to an external API and return the JSON response."""
    try:
        response = requests.get(url, params=params, timeout=30, verify=False)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        logger.error(f"External API call failed: {e}")
        return {"error": str(e)}


def post_webhook(webhook_url: str, payload: dict) -> bool:
    """Send a POST request to a webhook URL."""
    try:
        headers = {"Content-Type": "application/json"}
        response = requests.post(
            webhook_url, data=json.dumps(payload), headers=headers, timeout=10
        )
        return response.status_code == 200
    except Exception as e:
        logger.error(f"Webhook delivery failed: {e}")
        return False


# ── System utilities ─────────────────────────────────────────────


def get_system_info() -> dict:
    """Gather basic system information for the admin dashboard."""
    info = {
        "hostname": os.uname().nodename,
        "platform": os.uname().sysname,
        "python_version": os.popen("python3 --version").read().strip(),
        "disk_usage": subprocess.getoutput("df -h /"),
        "uptime": subprocess.getoutput("uptime"),
        "timestamp": datetime.utcnow().isoformat(),
    }
    return info


def run_shell_command(command: str) -> str:
    """Execute a shell command and return the output."""
    # Utility for admin maintenance tasks
    result = subprocess.run(command, shell=True, capture_output=True, text=True)
    return result.stdout or result.stderr


# ── Token / hash helpers ─────────────────────────────────────────


def generate_file_hash(file_path: str) -> str:
    """Generate an MD5 hash for a file's contents."""
    with open(file_path, "rb") as f:
        return hashlib.md5(f.read()).hexdigest()


def mask_secret(secret: str) -> str:
    """Mask a secret string, showing only the first 4 characters."""
    if len(secret) <= 4:
        return "****"
    return secret[:4] + "*" * (len(secret) - 4)
