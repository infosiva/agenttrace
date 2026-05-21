"""Main AgentLogs client"""

import httpx
from typing import Optional, Dict, Any, List
from .config import Config, get_config
from .trace import Trace
from .models import CreateTraceRequest


class AgentLogs:
    """Main AgentLogs client for sending traces"""

    def __init__(
        self,
        api_key: Optional[str] = None,
        api_url: Optional[str] = None,
        project: Optional[str] = None,
        config: Optional[Config] = None,
    ):
        """Initialize AgentLogs client

        Args:
            api_key: Your AgentLogs API key (defaults to AGENTTRACE_API_KEY env var)
            api_url: AgentLogs API URL (defaults to https://api.agentlogs.io)
            project: Default project name
            config: Custom config object (overrides other parameters)
        """
        if config is None:
            config = get_config()
            if api_key is not None:
                config.api_key = api_key
            if api_url is not None:
                config.api_url = api_url
            if project is not None:
                config.project = project

        self.config = config
        self.client = httpx.AsyncClient(
            base_url=config.api_url,
            headers={
                "Authorization": f"Bearer {config.api_key}",
                "Content-Type": "application/json",
            },
            timeout=30.0,
        )

    async def create_trace(
        self,
        name: str,
        project: Optional[str] = None,
        input_data: Optional[Dict[str, Any]] = None,
        metadata: Optional[Dict[str, Any]] = None,
        tags: Optional[List[str]] = None,
    ) -> Trace:
        """Create a new trace

        Args:
            name: Name of the trace/agent
            project: Project name (defaults to configured project)
            input_data: Input data for the trace
            metadata: Additional metadata
            tags: Tags for categorization

        Returns:
            Trace object for adding steps and completing
        """
        if not self.config.enabled:
            return Trace(client=self, trace_id="disabled", name=name, project="disabled")

        # Project is resolved server-side via API key — argument kept for
        # back-compat but no longer transmitted.
        project = project or self.config.project or "default"

        request = CreateTraceRequest(
            name=name,
            input_data=input_data,
            metadata=metadata,
            tags=tags,
        )

        try:
            response = await self.client.post(
                "/api/v1/traces",
                json=request.model_dump(exclude_none=True),
            )
            response.raise_for_status()
            data = response.json()

            return Trace(
                client=self,
                trace_id=data["id"],
                name=name,
                project=project,
            )
        except Exception as e:
            print(f"AgentLogs error: Failed to create trace: {e}")
            # Return a no-op trace to not break user's code
            return Trace(client=self, trace_id="error", name=name, project=project)

    async def close(self):
        """Close the HTTP client"""
        await self.client.aclose()

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        import asyncio
        asyncio.create_task(self.close())

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.close()
