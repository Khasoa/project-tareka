from __future__ import annotations

from fastapi import APIRouter, Depends, Form, Request
from fastapi.responses import PlainTextResponse
from slowapi.errors import RateLimitExceeded
from sqlalchemy.orm import Session

from app.core.rate_limit import limiter
from app.db.session import get_db
from app.services.ussd_service import handle_session

router = APIRouter(prefix="/ussd", tags=["ussd"])


@router.post("", response_class=PlainTextResponse)
@limiter.limit("30/minute")
def ussd_entry(
    request: Request,
    sessionId: str = Form(...),
    serviceCode: str = Form(...),
    phoneNumber: str = Form(...),
    text: str = Form(""),
    db: Session = Depends(get_db),
):
    _ = (request, serviceCode)
    try:
        out = handle_session(sessionId, phoneNumber, text, db)
        return PlainTextResponse(content=out)
    except RateLimitExceeded:
        return PlainTextResponse(content="END Service temporarily unavailable.")
    except Exception:
        return PlainTextResponse(content="END Service temporarily unavailable.")
