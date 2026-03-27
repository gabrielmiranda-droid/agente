ROLE_DEV = "dev"
ROLE_ATTENDANT = "attendant"

ALL_ROLES = (ROLE_DEV, ROLE_ATTENDANT)
DEV_ONLY_ROLES = (ROLE_DEV,)
OPERATIONAL_ROLES = (ROLE_DEV, ROLE_ATTENDANT)

LEGACY_ROLE_MAP = {
    "admin": ROLE_DEV,
    "manager": ROLE_ATTENDANT,
}


def normalize_role_name(role_name: str | None) -> str | None:
    if not role_name:
        return role_name
    return LEGACY_ROLE_MAP.get(role_name, role_name)


def is_dev_role(role_name: str | None) -> bool:
    return normalize_role_name(role_name) == ROLE_DEV
