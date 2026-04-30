from __future__ import annotations

import json
from typing import Any

import redis

from app.core.config import settings


def _client() -> redis.Redis:
    return redis.from_url(settings.REDIS_URL, decode_responses=True)


def cache_get_json(key: str) -> Any | None:
    try:
        raw = _client().get(key)
        if raw is None:
            return None
        return json.loads(raw)
    except (redis.RedisError, json.JSONDecodeError):
        return None


def cache_set_json(key: str, value: Any, ttl_seconds: int) -> None:
    try:
        _client().setex(key, ttl_seconds, json.dumps(value, default=str))
    except redis.RedisError:
        return


def cache_delete(key: str) -> None:
    try:
        _client().delete(key)
    except redis.RedisError:
        return
