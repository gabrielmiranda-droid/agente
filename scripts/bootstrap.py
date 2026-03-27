from app.core.config import get_settings
from app.db.base import Base
from app.db.init_db import bootstrap_initial_company, seed_base_data
from app.db.session import get_engine, get_session_factory


def main() -> None:
    Base.metadata.create_all(bind=get_engine())
    session = get_session_factory()()
    try:
        seed_base_data(session)
        bootstrap_initial_company(session)
    finally:
        session.close()

    settings = get_settings()
    print(f"Bootstrap concluído para {settings.app_name}")


if __name__ == "__main__":
    main()
