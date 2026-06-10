"""Load submission file field bytes for download endpoints."""
import base64
import os
from pathlib import Path
from typing import Any, Optional, Tuple


def load_submission_field_file(value: Any, field_id: str = "file") -> Tuple[Optional[bytes], str, str]:
    """Return (raw_bytes, mime_type, filename) for a submission data field value."""
    mime = "application/octet-stream"
    filename = f"{field_id}.bin"
    raw: Optional[bytes] = None

    if isinstance(value, str) and value.startswith("data:"):
        header, _, encoded = value.partition(",")
        mime = header[5:].split(";")[0] if header.startswith("data:") else mime
        try:
            raw = base64.b64decode(encoded)
        except Exception:
            return None, mime, filename
        ext = mime.split("/")[-1] if "/" in mime else "bin"
        if ext == "vnd.openxmlformats-officedocument.presentationml.presentation":
            ext = "pptx"
        elif ext == "pdf":
            ext = "pdf"
        filename = f"{field_id}.{ext}"
    elif isinstance(value, dict) and value.get("_stored_file"):
        meta = value
        mime = str(meta.get("mime") or meta.get("mime_type") or meta.get("content_type") or mime)
        filename = str(meta.get("filename") or filename)
        storage_key = meta.get("storage_key") or meta.get("path")
        if storage_key:
            upload_root = Path(os.getenv("UPLOAD_DIR", "uploads"))
            file_path = upload_root / str(storage_key).lstrip("/")
            if file_path.is_file():
                raw = file_path.read_bytes()
        if raw is None and meta.get("data_uri"):
            data_uri = str(meta["data_uri"])
            if data_uri.startswith("data:"):
                header, _, encoded = data_uri.partition(",")
                mime = header[5:].split(";")[0] if header.startswith("data:") else mime
                try:
                    raw = base64.b64decode(encoded)
                except Exception:
                    raw = None

    return raw, mime, filename
