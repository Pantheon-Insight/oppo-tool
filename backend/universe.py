import httpx
import csv
import io
import json
from typing import List, Optional
from models import Attack
import anthropic
import os


async def fetch_universes(sheet_url: str) -> List[str]:
    """
    Fetch universe list from Google Sheets CSV export.
    Parses column A (skipping the first 2 header rows: title + column header)
    and returns list of universe names.
    """
    try:
        async with httpx.AsyncClient(follow_redirects=True) as client:
            response = await client.get(sheet_url, timeout=30.0)
            response.raise_for_status()

        csv_content = response.text
        reader = csv.reader(io.StringIO(csv_content))

        universes = []
        for i, row in enumerate(reader):
            if i < 2:  # Skip title row ("OTS Inventory Catalog") and header row ("Model Name")
                continue
            if row and row[0].strip():
                universes.append(row[0].strip())

        return universes
    except Exception as e:
        print(f"Error fetching universes: {e}")
        return []


def _match_batch(client, model: str, batch: List[Attack], universes: List[str]) -> List[dict]:
    """Match a single batch of attacks to universes via Claude API."""
    attacks_json = []
    for attack in batch:
        attacks_json.append({
            "number": attack.number,
            "category": attack.category,
            "attack": attack.attack,
            "key_detail": attack.key_detail,
            "severity": attack.severity.value
        })

    universes_str = "\n".join([f"- {u}" for u in universes])
    attacks_str = json.dumps(attacks_json, indent=2)

    prompt = f"""You are an opposition research universe matcher. Your task is to match each attack/hit to the most relevant universes from the provided list.

AVAILABLE UNIVERSES:
{universes_str}

ATTACKS TO MATCH:
{attacks_str}

For each attack, determine:
1. best_universe: The single most relevant universe
2. secondary_universe: The second most relevant universe (if applicable)
3. tertiary_universe: The third most relevant universe (if applicable)

Consider the attack's category, content, and severity when making matches. If an attack doesn't clearly fit any universe, use the closest match or leave secondary/tertiary empty.

Return a JSON array with the same structure as the input, but add "best_universe", "secondary_universe", and "tertiary_universe" fields to each attack. Return ONLY the JSON array, no other text."""

    response = client.messages.create(
        model=model,
        max_tokens=4000,
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    result_text = response.content[0].text
    if "```json" in result_text:
        result_text = result_text.split("```json")[1].split("```")[0].strip()
    elif "```" in result_text:
        result_text = result_text.split("```")[1].split("```")[0].strip()

    return json.loads(result_text)


def match_universes(attacks: List[Attack], universes: List[str]) -> List[Attack]:
    """
    Use Claude API to match each attack to best/secondary/tertiary universes.
    Batches attacks into groups of 25 to avoid exceeding context limits.
    Returns attacks with universe fields populated.
    """
    if not universes:
        return attacks

    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise ValueError("ANTHROPIC_API_KEY environment variable not set")

    client = anthropic.Anthropic(api_key=api_key)
    model = os.getenv("CLAUDE_MODEL", "claude-sonnet-4-20250514")

    BATCH_SIZE = 25
    all_matched = []

    for i in range(0, len(attacks), BATCH_SIZE):
        batch = attacks[i:i + BATCH_SIZE]
        print(f"Matching universes for attacks {i+1}-{i+len(batch)} of {len(attacks)}...")
        try:
            matched_data = _match_batch(client, model, batch, universes)
            all_matched.extend(matched_data)
        except (json.JSONDecodeError, IndexError, KeyError) as e:
            print(f"Error parsing universe matches for batch starting at {i+1}: {e}")
            all_matched.extend([{}] * len(batch))
        except Exception as e:
            print(f"Error matching batch starting at {i+1}: {e}")
            all_matched.extend([{}] * len(batch))

    # Update original attacks with universe matches
    for i, attack in enumerate(attacks):
        if i < len(all_matched):
            matched_data = all_matched[i]
            attack.best_universe = matched_data.get("best_universe")
            attack.secondary_universe = matched_data.get("secondary_universe")
            attack.tertiary_universe = matched_data.get("tertiary_universe")

    return attacks
