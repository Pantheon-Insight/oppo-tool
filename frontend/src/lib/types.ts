export type Severity = 'Major' | 'Moderate' | 'Minor' | 'Niche';

export interface Attack {
  number: number;
  category: string;
  attack: string;
  key_detail: string;
  severity: Severity;
  best_universe: string | null;
  secondary_universe: string | null;
  tertiary_universe: string | null;
  notes: string | null;
}

export interface ExtractionResult {
  job_id: string;
  filename: string;
  subject: string;
  total_attacks: number;
  attacks: Attack[];
  universes_used: string[];
}

export interface UploadResponse {
  job_id: string;
  filename: string;
  page_count: number;
  status: string;
}

export interface UniversesResponse {
  universes: string[];
  source: string;
  count: number;
}
