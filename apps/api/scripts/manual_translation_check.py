from __future__ import annotations

import asyncio
from dataclasses import dataclass

import app.controllers.ai_controller as ai_controller
from app.db.session import SessionLocal
from app.services import translation_service as ts


def _print(title: str, value):
    print(f"\n[{title}]\n{value}")


@dataclass
class DummyUser:
    id: str
    language: str


async def main() -> None:
    db = SessionLocal()
    try:
        # 1) English -> Swahili (mock nllb success)
        original_nllb = ts._translate_with_nllb
        original_claude = ts.AIService.strict_translate_with_claude

        async def fake_nllb(text: str, source_language: str, target_language: str) -> str:
            return f"sw::{text}" if target_language == "sw" else f"en::{text}"

        async def fake_claude(self, text: str, target_language: str):
            return {"translated": f"claude::{target_language}::{text}"}

        ts._translate_with_nllb = fake_nllb
        ts.AIService.strict_translate_with_claude = fake_claude

        r1 = await ts.translate_content(db, text="Hello recycler", target_language="sw", actor_user_id=None)
        _print("1 en->sw", r1)

        # 2) Swahili -> English (mock nllb success)
        r2 = await ts.translate_content(db, text="Habari na asante", target_language="en", actor_user_id=None)
        _print("2 sw->en", r2)

        # 3) English -> English skips translation
        r3 = await ts.translate_content(db, text="Please track impact", target_language="en", actor_user_id=None)
        _print("3 en->en skip", r3)

        # 4) Swahili -> Swahili skips translation
        r4 = await ts.translate_content(db, text="Tafadhali fuatilia athari", target_language="sw", actor_user_id=None)
        _print("4 sw->sw skip", r4)

        # 5) Unknown source still attempts translation
        r5 = await ts.translate_content(db, text="12345 -- ???", target_language="sw", actor_user_id=None)
        _print("5 unknown source", r5)

        # 6) NLLB failure triggers Claude fallback
        async def fail_nllb(*args, **kwargs):
            raise RuntimeError("nllb down")

        ts._translate_with_nllb = fail_nllb
        r6 = await ts.translate_content(db, text="Hello tareka partner", target_language="sw", actor_user_id=None)
        _print("6 nllb fallback claude", r6)

        # 7) All-provider failure returns original text safely
        async def fail_claude(self, text: str, target_language: str):
            raise RuntimeError("claude down")

        ts.AIService.strict_translate_with_claude = fail_claude
        r7 = await ts.translate_content(db, text="Hello safety", target_language="sw", actor_user_id=None)
        _print("7 all providers fail", r7)

        # restore fallback for next checks
        ts.AIService.strict_translate_with_claude = fake_claude
        ts._translate_with_nllb = fake_nllb

        # 8) translate_for_user uses user.language
        fake_user = DummyUser(id="u1", language="sw")
        r8 = await ts.translate_for_user(db, text="Hello dashboard", user=fake_user)
        _print("8 translate_for_user", r8)

        # 9) translate_for_channel returns text and does not send messages
        r9_sms = await ts.translate_for_channel(db, text="Hello notification channel", target_language="sw", channel="sms")
        r9_ussd = await ts.translate_for_channel(db, text="Hello: use tareka!", target_language="sw", channel="ussd")
        _print("9 channel sms", r9_sms)
        _print("9 channel ussd", r9_ussd)

        # 10) task status endpoint safe response
        class FakeAsyncResult:
            def __init__(self, task_id: str, app=None):
                self.id = task_id
                self.status = "SUCCESS"
                self.result = {"ok": True}

        original_async_result = ai_controller.AsyncResult
        ai_controller.AsyncResult = FakeAsyncResult
        r10 = ai_controller.ai_task_status(task_id="demo-task-id")
        ai_controller.AsyncResult = original_async_result
        _print("10 task status", r10)

        # restore originals
        ts._translate_with_nllb = original_nllb
        ts.AIService.strict_translate_with_claude = original_claude
    finally:
        db.close()


if __name__ == "__main__":
    asyncio.run(main())
