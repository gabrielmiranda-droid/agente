from __future__ import annotations

import asyncio
from collections.abc import Mapping
from typing import Any

import httpx

from app.core.config import get_settings
from app.core.logging_config import get_logger

logger = get_logger(__name__)


class ResilientHttpClient:
    def __init__(self, *, timeout: float, attempts: int, backoff_seconds: float) -> None:
        self.timeout = timeout
        self.attempts = attempts
        self.backoff_seconds = backoff_seconds

    async def post_json(
        self,
        *,
        url: str,
        headers: Mapping[str, str] | None = None,
        json_body: dict[str, Any] | list[Any] | None = None,
        operation_name: str,
        retry_on_statuses: set[int] | None = None,
    ) -> httpx.Response:
        retryable_statuses = retry_on_statuses or {408, 409, 425, 429, 500, 502, 503, 504}
        last_error: Exception | None = None

        for attempt in range(1, self.attempts + 1):
            try:
                async with httpx.AsyncClient(timeout=self.timeout) as client:
                    response = await client.post(url, headers=headers, json=json_body)
                    if response.status_code in retryable_statuses and attempt < self.attempts:
                        logger.warning(
                            f"{operation_name}_retryable_status",
                            extra={"status_code": response.status_code, "attempt": attempt},
                        )
                        await asyncio.sleep(self.backoff_seconds * attempt)
                        continue

                    response.raise_for_status()
                    return response
            except (httpx.TimeoutException, httpx.NetworkError, httpx.RemoteProtocolError) as exc:
                last_error = exc
                if attempt >= self.attempts:
                    raise
                logger.warning(
                    f"{operation_name}_retry",
                    extra={"attempt": attempt, "error_type": exc.__class__.__name__},
                )
                await asyncio.sleep(self.backoff_seconds * attempt)
            except httpx.HTTPStatusError as exc:
                last_error = exc
                if exc.response.status_code not in retryable_statuses or attempt >= self.attempts:
                    raise
                logger.warning(
                    f"{operation_name}_retry",
                    extra={"attempt": attempt, "status_code": exc.response.status_code},
                )
                await asyncio.sleep(self.backoff_seconds * attempt)

        if last_error:
            raise last_error

        raise RuntimeError(f"{operation_name} failed unexpectedly")


def build_default_http_client(timeout: float) -> ResilientHttpClient:
    settings = get_settings()
    return ResilientHttpClient(
        timeout=timeout,
        attempts=settings.external_retry_attempts,
        backoff_seconds=settings.external_retry_backoff_seconds,
    )
