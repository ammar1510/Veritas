from google import genai
from google.genai.types import HttpOptions
from app.config import settings
import json
import os
from datetime import datetime
from typing import Dict, List


class GeminiService:
    def __init__(self):
        # Set environment variables for Vertex AI
        os.environ["GOOGLE_CLOUD_PROJECT"] = settings.google_cloud_project
        os.environ["GOOGLE_CLOUD_LOCATION"] = settings.google_cloud_location
        os.environ["GOOGLE_GENAI_USE_VERTEXAI"] = "True"

        # Create client
        self.client = genai.Client(
            api_key=settings.google_api_key,
            http_options=HttpOptions(api_version="v1")
        )

    async def discover_timeline_skeleton(self, query: str) -> Dict:
        """
        Phase 1: Use Gemini Pro to discover timeline skeleton
        Returns: Dictionary with topic, date_range, and anchor_events
        """
        prompt = f"""
        You are a timeline researcher. Given a query about an event or topic, identify the key timeline structure.

        Query: {query}

        Provide a structured JSON response with:
        1. topic: STRING - A concise name for the timeline
        2. date_range: OBJECT with:
           - start: STRING - ISO 8601 datetime (e.g., "2019-04-15T18:20:00Z")
           - end: STRING - ISO 8601 datetime (e.g., "2019-04-20T12:00:00Z")
        3. anchor_events: ARRAY of 5-10 major events, each with:
           - title: STRING - Event title
           - date: STRING - ISO 8601 datetime (e.g., "2019-04-15T18:20:00Z")
           - priority: STRING - One of: "critical", "high", "medium", "low"

        IMPORTANT: All dates MUST be strings in ISO 8601 format.
        Return ONLY valid JSON matching this exact structure, no additional text.
        """

        try:
            response = self.client.models.generate_content(
                model="gemini-2.5-pro",
                contents=prompt
            )

            # Extract JSON from response
            result_text = response.text
            # Remove markdown code blocks if present
            if "```json" in result_text:
                result_text = result_text.split("```json")[1].split("```")[0].strip()
            elif "```" in result_text:
                result_text = result_text.split("```")[1].split("```")[0].strip()

            return json.loads(result_text)
        except json.JSONDecodeError as e:
            # Fallback: return empty structure
            return {
                "topic": query,
                "date_range": {
                    "start": datetime.now().isoformat(),
                    "end": datetime.now().isoformat()
                },
                "anchor_events": []
            }
        except Exception as e:
            print(f"Error in discover_timeline_skeleton: {e}")
            return {
                "topic": query,
                "date_range": {
                    "start": datetime.now().isoformat(),
                    "end": datetime.now().isoformat()
                },
                "anchor_events": []
            }

    async def investigate_event(self, event_title: str, event_date: str, context: str) -> Dict:
        """
        Phase 2: Use Gemini Flash to investigate a single event
        Returns: Dictionary with sources, claims, and conflicts
        """
        prompt = f"""
        You are investigating a specific event for a timeline.

        Event: {event_title}
        Date: {event_date}
        Context: {context}

        Provide a JSON response with:
        1. sources: ARRAY of 5-10 credible sources, each with:
           - url: STRING - Source URL (real URLs when possible)
           - outlet: STRING - Publisher name (e.g., "BBC", "Reuters")
           - credibility_score: NUMBER - Between 0.0 and 1.0
           - publish_date: STRING - ISO 8601 datetime (e.g., "2019-04-15T20:00:00Z")
           - claims: ARRAY of STRINGS - Key claims from this source
        2. conflicts: ARRAY of STRINGS - Any conflicting narratives you identify

        IMPORTANT:
        - All dates MUST be strings in ISO 8601 format
        - claims MUST be an array of strings
        Return ONLY valid JSON matching this exact structure, no additional text.
        """

        try:
            response = self.client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt
            )

            result_text = response.text
            if "```json" in result_text:
                result_text = result_text.split("```json")[1].split("```")[0].strip()
            elif "```" in result_text:
                result_text = result_text.split("```")[1].split("```")[0].strip()

            return json.loads(result_text)
        except json.JSONDecodeError:
            return {
                "sources": [],
                "conflicts": []
            }
        except Exception as e:
            print(f"Error in investigate_event: {e}")
            return {
                "sources": [],
                "conflicts": []
            }

    async def synthesize_branches(self, event_title: str, sources_data: List[Dict]) -> List[Dict]:
        """
        Phase 3: Use Gemini Pro to detect narrative branches
        Returns: List of branches with credibility scores
        """
        prompt = f"""
        You are analyzing sources for an event to identify narrative branches.

        Event: {event_title}
        Sources Data: {json.dumps(sources_data, indent=2)}

        Identify distinct narrative branches (competing claims about what happened).
        Return a JSON ARRAY where each branch has:
        - narrative: STRING - Clear description of this version of events
        - credibility_score: NUMBER - Between 0.0 and 1.0 based on source quality and consensus
        - evidence: STRING - Supporting quotes or facts combined into a single text paragraph
        - source_count: NUMBER - Count of sources supporting this narrative

        IMPORTANT:
        - evidence MUST be a STRING (single paragraph), NOT an array
        - If you have multiple pieces of evidence, combine them into one paragraph separated by spaces or periods
        Return ONLY a valid JSON array of branches matching this exact structure, no additional text.
        """

        try:
            response = self.client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt
            )

            result_text = response.text
            if "```json" in result_text:
                result_text = result_text.split("```json")[1].split("```")[0].strip()
            elif "```" in result_text:
                result_text = result_text.split("```")[1].split("```")[0].strip()

            return json.loads(result_text)
        except json.JSONDecodeError:
            return []
        except Exception as e:
            print(f"Error in synthesize_branches: {e}")
            return []
