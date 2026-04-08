import { UploadResponse, ExtractionResult, UniversesResponse } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function uploadFile(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_URL}/api/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new ApiError(response.status, `Upload failed: ${error}`);
  }

  return response.json();
}

export async function extractAttacks(jobId: string): Promise<ExtractionResult> {
  const response = await fetch(`${API_URL}/api/extract`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ job_id: jobId }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new ApiError(response.status, `Extraction failed: ${error}`);
  }

  return response.json();
}

export async function getResults(jobId: string): Promise<ExtractionResult> {
  const response = await fetch(`${API_URL}/api/results/${jobId}`);

  if (!response.ok) {
    const error = await response.text();
    throw new ApiError(response.status, `Failed to fetch results: ${error}`);
  }

  return response.json();
}

export async function getUniverses(): Promise<UniversesResponse> {
  const response = await fetch(`${API_URL}/api/universes`);

  if (!response.ok) {
    const error = await response.text();
    throw new ApiError(response.status, `Failed to fetch universes: ${error}`);
  }

  return response.json();
}

export async function exportXlsx(jobId: string): Promise<Blob> {
  const response = await fetch(`${API_URL}/api/export/${jobId}`, {
    method: 'POST',
  });

  if (!response.ok) {
    const error = await response.text();
    throw new ApiError(response.status, `Export failed: ${error}`);
  }

  return response.blob();
}

export async function healthCheck(): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/api/health`);
    return response.ok;
  } catch {
    return false;
  }
}

export function downloadFile(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}
