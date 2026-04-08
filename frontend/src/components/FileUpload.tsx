'use client';

import { useRef, useState } from 'react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  loading: boolean;
}

const ALLOWED_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const ALLOWED_EXTENSIONS = ['.pdf', '.docx'];
const MAX_SIZE = 50 * 1024 * 1024; // 50MB

export function FileUpload({ onFileSelect, loading }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): boolean => {
    setError(null);

    // Check file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Only PDF and DOCX files are supported');
      return false;
    }

    // Check file size
    if (file.size > MAX_SIZE) {
      setError('File must be smaller than 50MB');
      return false;
    }

    return true;
  };

  const handleFile = (file: File) => {
    if (validateFile(file)) {
      onFileSelect(file);
    }
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
        dragActive
          ? 'border-blue-400 bg-blue-950 bg-opacity-30'
          : 'border-slate-600 bg-slate-800 bg-opacity-50'
      } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-slate-500'}`}
    >
      <input
        ref={inputRef}
        type="file"
        onChange={handleChange}
        accept={ALLOWED_EXTENSIONS.join(',')}
        className="hidden"
        disabled={loading}
      />

      <div className="flex justify-center mb-4">
        <svg className="w-16 h-16 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
      </div>

      <h2 className="text-2xl font-bold text-white mb-2">Upload Opposition Research Book</h2>
      <p className="text-slate-400 mb-6">
        Drop a PDF or Word document to extract every attack and match to targeting universes
      </p>

      <button
        onClick={() => inputRef.current?.click()}
        disabled={loading}
        className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors mb-4"
      >
        {loading ? 'Uploading...' : 'Choose File'}
      </button>

      <p className="text-sm text-slate-500">
        Supports: PDF, DOCX • Max size: 50MB
      </p>

      {error && (
        <p className="mt-4 text-red-400 text-sm">{error}</p>
      )}
    </div>
  );
}
