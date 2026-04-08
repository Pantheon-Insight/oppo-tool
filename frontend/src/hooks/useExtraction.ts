import { useState, useCallback } from 'react';
import {
  uploadFile,
  extractAttacks,
  getResults,
  ApiError,
} from '@/lib/api';
import { UploadResponse, ExtractionResult } from '@/lib/types';

type ExtractionState = 'idle' | 'uploading' | 'extracting' | 'success' | 'error';

const POLLING_INTERVAL = 2000;
const MAX_POLLS = 60;

export function useExtraction() {
  const [state, setState] = useState<ExtractionState>('idle');
  const [uploadResponse, setUploadResponse] = useState<UploadResponse | null>(null);
  const [results, setResults] = useState<ExtractionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);

  const reset = useCallback(() => {
    setState('idle');
    setUploadResponse(null);
    setResults(null);
    setError(null);
    setProgress(0);
  }, []);

  const handleFileUpload = useCallback(async (file: File) => {
    try {
      setError(null);
      setState('uploading');
      setProgress(0);

      const response = await uploadFile(file);
      setUploadResponse(response);
      setProgress(33);

      setState('extracting');
      setProgress(50);

      let pollCount = 0;
      let extractionResult: ExtractionResult | null = null;

      while (pollCount < MAX_POLLS) {
        try {
          extractionResult = await getResults(response.job_id);
          if (extractionResult && extractionResult.attacks) {
            break;
          }
        } catch (err) {
          // Results not ready yet, continue polling
        }

        await new Promise((resolve) => setTimeout(resolve, POLLING_INTERVAL));
        pollCount++;
        setProgress(50 + (pollCount / MAX_POLLS) * 40);
      }

      if (!extractionResult) {
        // Try extraction endpoint as fallback
        extractionResult = await extractAttacks(response.job_id);
      }

      setResults(extractionResult);
      setProgress(100);
      setState('success');
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'An unknown error occurred';
      setError(message);
      setState('error');
    }
  }, []);

  return {
    state,
    uploadResponse,
    results,
    error,
    progress,
    handleFileUpload,
    reset,
  };
}
