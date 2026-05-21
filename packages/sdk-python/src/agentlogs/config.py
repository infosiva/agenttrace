"""Configuration management for AgentLogs SDK"""

import os
from typing import Optional
from dataclasses import dataclass, field


DEFAULT_API_URL = "https://agentlogs.app"


@dataclass
class Config:
    """AgentLogs configuration"""

    api_key: Optional[str] = field(default=None)
    api_url: str = field(default=DEFAULT_API_URL)
    project: Optional[str] = field(default=None)
    enabled: bool = field(default=True)
    batch_size: int = field(default=10)
    flush_interval: float = field(default=5.0)

    def __post_init__(self):
        if self.api_key is None:
            self.api_key = os.getenv("AGENTLOGS_API_KEY")

        if self.project is None:
            self.project = os.getenv("AGENTLOGS_PROJECT", "default")

        env_url = os.getenv("AGENTLOGS_API_URL")
        if env_url:
            self.api_url = env_url


_global_config: Optional[Config] = None


def configure(
    api_key: Optional[str] = None,
    api_url: str = DEFAULT_API_URL,
    project: Optional[str] = None,
    enabled: bool = True,
    batch_size: int = 10,
    flush_interval: float = 5.0,
) -> None:
    """Configure AgentLogs globally.

    Args:
        api_key: Your AgentLogs API key (or set AGENTLOGS_API_KEY env var)
        api_url: AgentLogs API URL (default: https://agentlogs.app)
        project: Default project name (or set AGENTLOGS_PROJECT env var)
        enabled: Enable/disable tracing
        batch_size: Number of events to batch before sending
        flush_interval: Seconds between automatic flushes
    """
    global _global_config
    _global_config = Config(
        api_key=api_key,
        api_url=api_url,
        project=project,
        enabled=enabled,
        batch_size=batch_size,
        flush_interval=flush_interval,
    )


def get_config() -> Config:
    """Get the global configuration, creating default if needed."""
    global _global_config
    if _global_config is None:
        _global_config = Config()
    return _global_config
