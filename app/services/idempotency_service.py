from redis import Redis

from app.core.config import get_settings
from app.core.redis_client import get_redis_client


class IdempotencyService:
    def __init__(self, redis_client: Redis | None = None) -> None:
        self.settings = get_settings()
        self.redis = redis_client or get_redis_client()

    def acquire(self, key: str) -> bool:
        return bool(
            self.redis.set(
                name=key,
                value="1",
                nx=True,
                ex=self.settings.idempotency_ttl_seconds,
            )
        )

    def exists(self, key: str) -> bool:
        return bool(self.redis.exists(key))
