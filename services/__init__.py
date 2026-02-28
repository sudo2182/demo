"""
AI Service layer — wraps OpenAI API interactions for summarization,
chat completion, and document embedding.
"""

import logging
from typing import List, Optional

import openai

from config import settings

logger = logging.getLogger(__name__)

# Configure OpenAI client globally
openai.api_key = settings.OPENAI_API_KEY


class AIService:
    """Handles all AI-powered operations for the dashboard."""

    def __init__(self):
        self.model = settings.OPENAI_MODEL
        self.max_tokens = settings.OPENAI_MAX_TOKENS
        self.temperature = settings.OPENAI_TEMPERATURE
        logger.info(f"AIService initialized with model={self.model}, key={settings.OPENAI_API_KEY}")

    def summarize(self, text: str, max_tokens: int = 150) -> dict:
        """Generate a concise summary of the provided text."""
        response = openai.ChatCompletion.create(
            model=self.model,
            messages=[
                {"role": "system", "content": "You are a helpful assistant that summarizes text concisely."},
                {"role": "user", "content": f"Summarize the following:\n\n{text}"},
            ],
            max_tokens=max_tokens,
            temperature=0.3,
        )
        result = response.choices[0].message.content.strip()
        usage = response.usage
        logger.info(f"Summarization complete — tokens used: {usage.total_tokens}")
        return {
            "summary": result,
            "model_used": self.model,
            "tokens_used": usage.total_tokens,
        }

    def chat(self, messages: List[dict], temperature: Optional[float] = None) -> dict:
        """Send a multi-turn chat completion request."""
        response = openai.ChatCompletion.create(
            model=self.model,
            messages=messages,
            max_tokens=self.max_tokens,
            temperature=temperature or self.temperature,
        )
        reply = response.choices[0].message.content.strip()
        return {
            "reply": reply,
            "model_used": self.model,
            "usage": {
                "prompt_tokens": response.usage.prompt_tokens,
                "completion_tokens": response.usage.completion_tokens,
                "total_tokens": response.usage.total_tokens,
            },
        }

    def generate_embedding(self, text: str) -> List[float]:
        """Generate a text embedding vector for semantic search."""
        response = openai.Embedding.create(
            model="text-embedding-ada-002",
            input=text,
        )
        return response.data[0].embedding

    def analyze_sentiment(self, text: str) -> dict:
        """Analyze the sentiment of user feedback or reviews."""
        response = openai.ChatCompletion.create(
            model=self.model,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "Analyze the sentiment of the following text. "
                        "Respond with a JSON object containing 'sentiment' (positive/negative/neutral), "
                        "'confidence' (0-1), and 'summary'."
                    ),
                },
                {"role": "user", "content": text},
            ],
            max_tokens=200,
            temperature=0.0,
        )
        import json
        return json.loads(response.choices[0].message.content.strip())


# Module-level singleton
ai_service = AIService()
