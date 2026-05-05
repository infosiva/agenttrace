"""Configuration management for AgentTrace SDK"""

import os
from typing import Optional
from dataclasses import dataclass, field


@dataclass
class Config:
    """AgentTrace configuration"""

    api_key: Optional[str] = field(default=None)
    api_url: str = field(default="https://api.agenttrace.io")
    project: Optional[str] = field(default=None)
    enabled: bool = field(default=True)
    batch_size: int = field(default=10)
    flush_interval: float = field(default=5.0)

    def __post_init__(self):
        # Load from environment if not set
        if self.api_key is None:
            self.api_key = os.getenv("AGENTTRACE_API_KEY")

        if self.project is None:
            self.project = os.getenv("AGENTTRACE_PROJECT", "default")

        # Override URL from environment if set
        env_url = os.getenv("AGENTTRACE_API_URL")
        if env_url:
            self.api_url = env_url


_global_config: Optional[Config] = None


def configure(
    api_key: Optional[str] = None,
    api_url: str = "https://api.agenttrace.io",
    project: Optional[str] = None,
    enabled: bool = True,
    batch_size: int = 10,
    flush_interval: float = 5.0,
) -> None:
    """Configure AgentTrace globally

    Args:
        api_key: Your AgentTrace API key
        api_url: AgentTrace API URL (default: https://api.agenttrace.io)
        project: Default project name
        enabled: Enable/disable tracing (default: True)
        batch_size: Number of traces to batch before sending
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
    """Get the global configuration, creating default if needed"""
    global _global_config
    if _global_config is None:
        _global_config = Config()
    return _global_config
