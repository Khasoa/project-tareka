from __future__ import annotations

from pydantic import BaseModel, Field


class OperatorSiteResponse(BaseModel):
    id: str
    name: str
    city: str
    address: str
    company_id: str


class SiteRewardContextResponse(BaseModel):
    site_id: str
    company_id: str
    reward_tokens_enabled: bool
    reward_kes_enabled: bool
    reward_sats_enabled: bool


class RecyclerSearchHit(BaseModel):
    id: str
    full_name: str
    phone: str | None = None
    email: str | None = None
