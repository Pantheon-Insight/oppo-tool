from pydantic import BaseModel
from typing import List, Optional
from enum import Enum


class Severity(str, Enum):
    MAJOR = "Major"
    MODERATE = "Moderate"
    MINOR = "Minor"
    NICHE = "Niche"


class Attack(BaseModel):
    number: int
    category: str
    attack: str
    key_detail: str
    severity: Severity
    best_universe: Optional[str] = None
    secondary_universe: Optional[str] = None
    tertiary_universe: Optional[str] = None
    notes: Optional[str] = None


class ExtractionResult(BaseModel):
    job_id: str
    filename: str
    subject: str
    total_attacks: int
    attacks: List[Attack]
    universes_used: List[str]


class UploadResponse(BaseModel):
    job_id: str
    filename: str
    page_count: int
    status: str
