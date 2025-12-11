'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DataGrid } from '@/components/ui/DataGrid';
import { apiClient } from '@/lib/api';
import { PreviewResponse } from '@/types';

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileId, setFileId] = useState<string>('');
  const [preview, setPreview] = useState<PreviewResponse | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      const response: any = await apiClient.uploadFile(selectedFile);
      setFileId(response.file_id);

      // Auto-preview after upload
      const previewData: PreviewResponse = await apiClient.previewFile(response.file_id);
      setPreview(previewData);
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Excel Tools
          </h1>
          <p className="text-xl text-gray-600">
            Professional Excel file processing with Persian & English support
          </p>
          <div className="mt-4 inline-block bg-primary text-white px-4 py-2 rounded-full text-sm font-medium">
            Powered by FastAPI • Feature-Sliced Design
          </div>
        </div>

        {/* File Upload */}
        <Card title="Upload Excel File" description="Upload your .xlsx or .xls file to get started" className="mb-8">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                className="flex-1 text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-hover file:cursor-pointer"
              />
              <Button
                onClick={handleUpload}
                isLoading={isUploading}
                disabled={!selectedFile}
                size="lg"
              >
                Upload & Preview
              </Button>
            </div>
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}
            {fileId && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  <span className="font-semibold">File ID:</span> {fileId}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Use this ID for all operations
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Preview */}
        {preview && (
          <Card
            title="File Preview"
            description={`Showing ${preview.preview_rows} of ${preview.total_rows} total rows`}
          >
            <DataGrid columns={preview.columns} data={preview.data} />
          </Card>
        )}

        {/* Features Grid */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { name: 'File Merge', desc: 'Combine multiple Excel files', icon: '📋' },
            { name: 'Deduplicate & Merge', desc: 'Remove duplicates and sum values', icon: '🔄' },
            { name: 'Sort Data', desc: 'Sort by any column', icon: '↕️' },
            { name: 'Number Normalization', desc: 'Persian ↔ English digits', icon: '۱٢' },
            { name: 'Data Filtering', desc: 'Filter rows with conditions', icon: '🔍' },
            { name: 'Column Management', desc: 'Rename, delete, reorder', icon: '📊' },
            { name: 'Search & Replace', desc: 'Find and replace text', icon: '🔎' },
            { name: 'Type Conversion', desc: 'Cast column data types', icon: '🔢' },
            { name: 'Calculated Columns', desc: 'Create formula-based columns', icon: '∑' },
            { name: 'Split Data', desc: 'Split into multiple files', icon: '✂️' },
          ].map((feature) => (
            <div
              key={feature.name}
              className="bg-white p-6 rounded-xl border border-gray-200 hover:border-primary hover:shadow-lg transition-all cursor-pointer group"
            >
              <div className="text-4xl mb-3">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary transition-colors">
                {feature.name}
              </h3>
              <p className="text-sm text-gray-600 mt-1">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* API Documentation Link */}
        <div className="mt-12 text-center">
          <a
            href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/docs`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary hover:text-primary-hover font-medium"
          >
            📚 View API Documentation
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
