"""AgentLogs Python SDK - AI Agent Observability."""

__version__ = "0.1.1"

from .client import AgentLogs
from .decorators import trace_agent
from .config import configure, get_config, Config
from .trace import Trace, TraceStep
from .models import StepType, TraceStatus

__all__ = [
    "AgentLogs",
    "trace_agent",
    "configure",
    "get_config",
    "Config",
    "Trace",
    "TraceStep",
    "StepType",
    "TraceStatus",
]


def __getattr__(name: str):
    # ponytail: lazy import so langchain-core isn't a hard dep for all users
    if name == "AgentLogsCallbackHandler":
        from .integrations.langchain import AgentLogsCallbackHandler
        return AgentLogsCallbackHandler
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")
