import json
from hashlib import sha256


def generate_dropoff_hash(payload: dict) -> str:
    serialized_payload = json.dumps(payload, sort_keys=True, default=str)
    return sha256(serialized_payload.encode("utf-8")).hexdigest()
