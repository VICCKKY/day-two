from pydantic_settings import BaseSettings, SettingsConfigDict


DEV_SECRET = "dev-only-secret-change-me-before-any-real-use"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_prefix="ANNACHI_")

    database_url: str = "sqlite:///./annachi.db"
    secret_key: str = DEV_SECRET
    admin_token: str = "dev-admin-token"
    jwt_minutes: int = 60 * 24 * 7

    # Demo mode: fixed OTP, payments recorded without a gateway.
    demo_mode: bool = True
    demo_otp: str = "123456"

    # Open product decisions, kept configurable (see INITIAL.md).
    max_unlocks_per_lead: int = 1
    report_window_days: int = 7

    membership_price_inr: int = 3000
    membership_days: int = 30
    support_whatsapp: str = ""

    cors_origins: str = "http://localhost:5173"


settings = Settings()
if not settings.demo_mode and settings.secret_key == DEV_SECRET:
    raise RuntimeError("Set ANNACHI_SECRET_KEY before turning demo mode off")

# credits, price in INR
LEAD_PACKS: dict[str, tuple[int, int]] = {
    "starter": (10, 1000),
    "growth": (50, 5000),
    "pro": (100, 10000),
}
