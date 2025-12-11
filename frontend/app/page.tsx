'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DataGrid } from '@/components/ui/DataGrid';
import { FeatureCard } from '@/components/ui/FeatureCard';
import { apiClient } from '@/lib/api';
import {
  FileMetadata,
  PreviewResponse,
  FilterOperator,
  FilterCondition,
  NormalizationDirection,
  SortOrder
} from '@/types';

export default function Home() {
  // Multi-file state - separated into uploaded and processed
  const [uploadedFiles, setUploadedFiles] = useState<FileMetadata[]>([]);
  const [processedFiles, setProcessedFiles] = useState<FileMetadata[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Feature-specific state
  const [selectedFileId, setSelectedFileId] = useState<string>('');
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]); // For multi-select
  const [isProcessing, setIsProcessing] = useState(false);

  // Helper function to toggle file selection
  const toggleFileSelection = (fileId: string) => {
    setSelectedFileIds(prev =>
      prev.includes(fileId) ? prev.filter(id => id !== fileId) : [...prev, fileId]
    );
  };

  // Toggle select all files
  const toggleSelectAll = () => {
    if (selectedFileIds.length === uploadedFiles.length) {
      setSelectedFileIds([]);
    } else {
      setSelectedFileIds(uploadedFiles.map(f => f.file_id));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setSelectedFiles(files);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setError('Please select at least one file');
      return;
    }

    setIsUploading(true);
    setError('');
    setSuccessMessage('');

    try {
      const newFiles: FileMetadata[] = [];

      for (const file of selectedFiles) {
        const response: any = await apiClient.uploadFile(file);
        const previewData = await apiClient.previewFile(response.file_id) as PreviewResponse;

        newFiles.push({
          file_id: response.file_id,
          filename: file.name,
          preview: previewData
        });
      }

      setUploadedFiles([...uploadedFiles, ...newFiles]);
      setSuccessMessage(`Successfully uploaded ${newFiles.length} file(s)`);
      setSelectedFiles([]);
      setSelectedFileIds([]); // Reset selections

      // Reset file input
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = (fileId: string, isProcessed: boolean = false) => {
    if (isProcessed) {
      setProcessedFiles(processedFiles.filter(f => f.file_id !== fileId));
    } else {
      setUploadedFiles(uploadedFiles.filter(f => f.file_id !== fileId));
    }
    if (selectedFileId === fileId) {
      setSelectedFileId('');
    }
    setSelectedFileIds(prev => prev.filter(id => id !== fileId));
  };

  // Download file handler
  const handleDownload = (fileId: string, filename: string) => {
    const downloadUrl = apiClient.getDownloadUrl(fileId);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Feature handlers
  const handleMergeFiles = async (fileIds: string[]) => {
    if (fileIds.length < 2) {
      setError('Please select at least 2 files to merge');
      return;
    }

    setIsProcessing(true);
    setError('');
    setSuccessMessage('');

    try {
      const response: any = await apiClient.mergeFiles(fileIds);
      const previewData = await apiClient.previewFile(response.file_id) as PreviewResponse;

      setProcessedFiles([...processedFiles, {
        file_id: response.file_id,
        filename: 'merged_file.xlsx',
        preview: previewData
      }]);

      setSuccessMessage(`✅ ${response.message} - New file ID: ${response.file_id}`);
    } catch (err: any) {
      setError(err.message || 'Merge failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSortData = async (fileId: string, column: string, order: SortOrder) => {
    setIsProcessing(true);
    setError('');
    setSuccessMessage('');

    try {
      const response: any = await apiClient.sortData(fileId, column, order);
      const previewData = await apiClient.previewFile(response.file_id) as PreviewResponse;

      setProcessedFiles([...processedFiles, {
        file_id: response.file_id,
        filename: 'sorted_file.xlsx',
        preview: previewData
      }]);

      setSuccessMessage(`✅ ${response.message} - New file ID: ${response.file_id}`);
    } catch (err: any) {
      setError(err.message || 'Sort failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNormalizeNumbers = async (fileId: string, direction: NormalizationDirection, columns: string[] | null) => {
    setIsProcessing(true);
    setError('');
    setSuccessMessage('');

    try {
      const response: any = await apiClient.normalizeNumbers(fileId, direction, columns);
      const previewData = await apiClient.previewFile(response.file_id) as PreviewResponse;

      setProcessedFiles([...processedFiles, {
        file_id: response.file_id,
        filename: 'normalized_file.xlsx',
        preview: previewData
      }]);

      setSuccessMessage(`✅ ${response.message} - New file ID: ${response.file_id}`);
    } catch (err: any) {
      setError(err.message || 'Normalization failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeduplicateMerge = async (fileId: string, duplicateColumns: string[]) => {
    setIsProcessing(true);
    setError('');
    setSuccessMessage('');

    try {
      const response: any = await apiClient.deduplicateMerge(fileId, duplicateColumns);
      const previewData = await apiClient.previewFile(response.file_id) as PreviewResponse;

      setProcessedFiles([...processedFiles, {
        file_id: response.file_id,
        filename: 'deduplicated.xlsx',
        preview: previewData
      }]);

      setSuccessMessage(`✅ ${response.message} - Duplicates removed: ${response.duplicates_removed}`);
    } catch (err: any) {
      setError(err.message || 'Deduplication failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFilter = async (fileId: string, conditions: FilterCondition[], matchAll: boolean) => {
    setIsProcessing(true);
    setError('');
    setSuccessMessage('');

    try {
      const response: any = await apiClient.filterData(fileId, conditions, matchAll);
      const previewData = await apiClient.previewFile(response.file_id) as PreviewResponse;

      setProcessedFiles([...processedFiles, {
        file_id: response.file_id,
        filename: 'filtered_file.xlsx',
        preview: previewData
      }]);

      setSuccessMessage(`✅ ${response.message} - Filtered from ${response.original_rows} to ${response.filtered_rows} rows`);
    } catch (err: any) {
      setError(err.message || 'Filtering failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRenameColumns = async (fileId: string, renameMap: Record<string, string>) => {
    setIsProcessing(true);
    setError('');
    setSuccessMessage('');

    try {
      const response: any = await apiClient.renameColumns(fileId, renameMap);
      const previewData = await apiClient.previewFile(response.file_id) as PreviewResponse;

      setProcessedFiles([...processedFiles, {
        file_id: response.file_id,
        filename: 'renamed_columns.xlsx',
        preview: previewData
      }]);

      setSuccessMessage(`✅ ${response.message}`);
    } catch (err: any) {
      setError(err.message || 'Rename columns failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSearchReplace = async (fileId: string, searchText: string, replaceText: string, columns: string[] | null, caseSensitive: boolean) => {
    setIsProcessing(true);
    setError('');
    setSuccessMessage('');

    try {
      const response: any = await apiClient.searchReplace(fileId, searchText, replaceText, columns, caseSensitive);
      const previewData = await apiClient.previewFile(response.file_id) as PreviewResponse;

      setProcessedFiles([...processedFiles, {
        file_id: response.file_id,
        filename: 'search_replaced.xlsx',
        preview: previewData
      }]);

      setSuccessMessage(`✅ ${response.message} - ${response.replacements_made} replacements made`);
    } catch (err: any) {
      setError(err.message || 'Search & Replace failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddCalculatedColumn = async (fileId: string, newColumnName: string, formula: string) => {
    setIsProcessing(true);
    setError('');
    setSuccessMessage('');

    try {
      const response: any = await apiClient.addCalculatedColumn(fileId, newColumnName, formula);
      const previewData = await apiClient.previewFile(response.file_id) as PreviewResponse;

      setProcessedFiles([...processedFiles, {
        file_id: response.file_id,
        filename: 'with_calculated_column.xlsx',
        preview: previewData
      }]);

      setSuccessMessage(`✅ ${response.message} - New column: ${response.new_column}`);
    } catch (err: any) {
      setError(err.message || 'Add calculated column failed');
    } finally {
      setIsProcessing(false);
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
        </div>

        {/* Global Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            {successMessage}
          </div>
        )}
        {/* More features will be added here */}

        {/* File Upload */}
        <Card title="Upload Excel Files" description="Upload one or more .xlsx or .xls files to get started" className="mb-8">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept=".xlsx,.xls"
                multiple
                onChange={handleFileSelect}
                className="flex-1 text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-hover file:cursor-pointer"
              />
              <Button
                onClick={handleUpload}
                isLoading={isUploading}
                disabled={selectedFiles.length === 0}
                size="lg"
              >
                Upload {selectedFiles.length > 0 && `(${selectedFiles.length})`}
              </Button>
            </div>
          </div>
        </Card>

        {/* Uploaded Files List */}
        {uploadedFiles.length > 0 && (
          <Card title="Uploaded Files" description={`${uploadedFiles.length} original file(s) uploaded`} className="mb-8">
            <div className="space-y-3">
              {/* Select All Checkbox */}
              <div className="flex items-center gap-2 pb-3 border-b border-gray-200">
                <input
                  type="checkbox"
                  checked={selectedFileIds.length === uploadedFiles.length && uploadedFiles.length > 0}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 cursor-pointer"
                />
                <label className="text-sm font-medium text-gray-700 cursor-pointer" onClick={toggleSelectAll}>
                  Select All ({selectedFileIds.length}/{uploadedFiles.length}) selected
                </label>
              </div>

              {uploadedFiles.map((file) => (
                <div key={file.file_id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3 flex-1">
                    <input
                      type="checkbox"
                      checked={selectedFileIds.includes(file.file_id)}
                      onChange={() => toggleFileSelection(file.file_id)}
                      className="w-4 h-4 cursor-pointer"
                    />
                    <span className="text-2xl">📄</span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{file.filename}</p>
                      <p className="text-xs text-gray-500">ID: {file.file_id}</p>
                      {file.preview && (
                        <p className="text-xs text-gray-600 mt-1">
                          {file.preview.total_rows} rows × {file.preview.columns.length} columns
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => setSelectedFileId(file.file_id)}
                      size="sm"
                      variant={selectedFileId === file.file_id ? 'primary' : 'secondary'}
                    >
                      {selectedFileId === file.file_id ? 'Selected' : 'Select'}
                    </Button>
                    <button
                      onClick={() => removeFile(file.file_id, false)}
                      className="text-red-600 hover:text-red-800 px-2 py-1"
                      title="Remove"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Processed Files List */}
        {processedFiles.length > 0 && (
          <Card title="Processed Files" description={`${processedFiles.length} processed file(s) ready to download`} className="mb-8">
            <div className="space-y-3">
              {processedFiles.map((file) => (
                <div key={file.file_id} className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-2xl">✅</span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{file.filename}</p>
                      <p className="text-xs text-gray-500">ID: {file.file_id}</p>
                      {file.preview && (
                        <p className="text-xs text-gray-600 mt-1">
                          {file.preview.total_rows} rows × {file.preview.columns.length} columns
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => handleDownload(file.file_id, file.filename)}
                      size="sm"
                      variant="primary"
                    >
                      📥 Download
                    </Button>
                    <Button
                      onClick={() => setSelectedFileId(file.file_id)}
                      size="sm"
                      variant={selectedFileId === file.file_id ? 'primary' : 'secondary'}
                    >
                      {selectedFileId === file.file_id ? 'Selected' : 'Preview'}
                    </Button>
                    <button
                      onClick={() => removeFile(file.file_id, true)}
                      className="text-red-600 hover:text-red-800 px-2 py-1"
                      title="Remove"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Preview Selected File */}
        {selectedFileId && (
          (() => {
            const selectedFile = [...uploadedFiles, ...processedFiles].find(f => f.file_id === selectedFileId);
            return selectedFile?.preview ? (
              <Card
                title="File Preview"
                description={`Showing preview of: ${selectedFile.filename}`}
                className="mb-8"
              >
                <DataGrid
                  columns={selectedFile.preview.columns}
                  data={selectedFile.preview.data}
                />
              </Card>
            ) : null;
          })()
        )}

        {/* Features Section - Always Visible */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Excel Processing Features</h2>
          <p className="text-sm text-gray-600 mb-6">
            {uploadedFiles.length === 0
              ? 'Upload files above to start using these features'
              : `${uploadedFiles.length} file(s) uploaded and ready for processing. ${selectedFileIds.length} file(s) selected.`
            }
          </p>

          {/* Feature 1: File Merge */}
          <FeatureMerge
            uploadedFiles={uploadedFiles}
            selectedFileIds={selectedFileIds}
            onMerge={handleMergeFiles}
            isProcessing={isProcessing}
          />

          {/* Feature 3: Sort Data */}
          <FeatureSort
            uploadedFiles={uploadedFiles}
            selectedFileId={selectedFileId}
            onSort={handleSortData}
            isProcessing={isProcessing}
          />

          {/* Feature 4: Number Normalization */}
          <FeatureNormalize
            uploadedFiles={uploadedFiles}
            selectedFileId={selectedFileId}
            onNormalize={handleNormalizeNumbers}
            isProcessing={isProcessing}
          />

          {/* Feature 2: Deduplicate & Merge */}
          <FeatureDeduplicateMerge
            uploadedFiles={uploadedFiles}
            selectedFileId={selectedFileId}
            onDeduplicateMerge={handleDeduplicateMerge}
            isProcessing={isProcessing}
          />

          {/* Feature 5: Data Filtering */}
          <FeatureFilter
            uploadedFiles={uploadedFiles}
            selectedFileId={selectedFileId}
            onFilter={handleFilter}
            isProcessing={isProcessing}
          />

          {/* Feature 6: Column Management */}
          <FeatureColumnManagement
            uploadedFiles={uploadedFiles}
            selectedFileId={selectedFileId}
            onRenameColumns={handleRenameColumns}
            isProcessing={isProcessing}
          />

          {/* Feature 7: Search & Replace */}
          <FeatureSearchReplace
            uploadedFiles={uploadedFiles}
            selectedFileId={selectedFileId}
            onSearchReplace={handleSearchReplace}
            isProcessing={isProcessing}
          />

          {/* Feature 9: Calculated Columns */}
          <FeatureCalculatedColumn
            uploadedFiles={uploadedFiles}
            selectedFileId={selectedFileId}
            onAddCalculatedColumn={handleAddCalculatedColumn}
            isProcessing={isProcessing}
          />

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

// ========== Feature Components ==========

function FeatureMerge({ uploadedFiles, selectedFileIds, onMerge, isProcessing }: any) {
  return (
    <FeatureCard title="Merge Files" description="Combine multiple Excel files into one" icon="📋">
      <div className="space-y-4">
        {selectedFileIds.length === 0 ? (
          <p className="text-sm text-amber-600">Please select files from the uploaded files list above (use checkboxes)</p>
        ) : (
          <>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-medium text-blue-900">Selected {selectedFileIds.length} file(s) for merging:</p>
              <ul className="text-xs text-blue-700 mt-2 space-y-1">
                {selectedFileIds.map((id: string) => {
                  const file = uploadedFiles.find((f: FileMetadata) => f.file_id === id);
                  return file ? <li key={id}>• {file.filename}</li> : null;
                })}
              </ul>
            </div>
            <Button
              onClick={() => onMerge(selectedFileIds)}
              isLoading={isProcessing}
              disabled={selectedFileIds.length < 2}
            >
              Merge {selectedFileIds.length} Files
            </Button>
          </>
        )}
      </div>
    </FeatureCard>
  );
}

function FeatureSort({ uploadedFiles, selectedFileId, onSort, isProcessing }: any) {
  const [column, setColumn] = useState('');
  const [order, setOrder] = useState<SortOrder>(SortOrder.ASCENDING);

  const selectedFile = uploadedFiles.find((f: FileMetadata) => f.file_id === selectedFileId);
  const columns = selectedFile?.preview?.columns || [];

  return (
    <FeatureCard title="Sort Data" description="Sort data by a specific column" icon="↕️">
      <div className="space-y-4">
        {!selectedFileId ? (
          <p className="text-sm text-amber-600">Please select a file from the uploaded files list above</p>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Column to sort by:</label>
              <select
                value={column}
                onChange={(e) => setColumn(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value="">-- Select Column --</option>
                {columns.map((col: string) => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort order:</label>
              <select
                value={order}
                onChange={(e) => setOrder(e.target.value as SortOrder)}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value="asc">Ascending (A → Z, 1 → 9)</option>
                <option value="desc">Descending (Z → A, 9 → 1)</option>
              </select>
            </div>
            <Button
              onClick={() => onSort(selectedFileId, column, order)}
              isLoading={isProcessing}
              disabled={!column}
            >
              Sort Data
            </Button>
          </>
        )}
      </div>
    </FeatureCard>
  );
}

function FeatureNormalize({ uploadedFiles, selectedFileId, onNormalize, isProcessing }: any) {
  const [direction, setDirection] = useState<NormalizationDirection>(NormalizationDirection.PERSIAN_TO_ENGLISH);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [applyToAll, setApplyToAll] = useState(true);

  const selectedFile = uploadedFiles.find((f: FileMetadata) => f.file_id === selectedFileId);
  const columns = selectedFile?.preview?.columns || [];

  return (
    <FeatureCard title="Number Normalization" description="Convert between Persian and English digits" icon="۱٢">
      <div className="space-y-4">
        {!selectedFileId ? (
          <p className="text-sm text-amber-600">Please select a file from the uploaded files list above</p>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Direction:</label>
              <select
                value={direction}
                onChange={(e) => setDirection(e.target.value as NormalizationDirection)}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value="persian_to_english">Persian → English (۱۲۳ → 123)</option>
                <option value="english_to_persian">English → Persian (123 → ۱۲۳)</option>
              </select>
            </div>
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={applyToAll}
                  onChange={(e) => setApplyToAll(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm">Apply to all columns</span>
              </label>
            </div>
            <Button
              onClick={() => onNormalize(selectedFileId, direction, applyToAll ? null : selectedColumns)}
              isLoading={isProcessing}
            >
              Normalize Numbers
            </Button>
          </>
        )}
      </div>
    </FeatureCard>
  );
}

// Feature 2: Deduplicate & Merge (Single File Deduplication)
function FeatureDeduplicateMerge({ uploadedFiles, selectedFileId, onDeduplicateMerge, isProcessing }: any) {
  const [duplicateColumns, setDuplicateColumns] = useState<string[]>([]);

  const selectedFile = uploadedFiles.find((f: FileMetadata) => f.file_id === selectedFileId);
  const columns = selectedFile?.preview?.columns || [];

  // Reset state when file changes
  useEffect(() => {
    setDuplicateColumns([]);
  }, [selectedFileId]);

  const toggleColumn = (column: string) => {
    if (duplicateColumns.includes(column)) {
      setDuplicateColumns(duplicateColumns.filter(c => c !== column));
    } else {
      setDuplicateColumns([...duplicateColumns, column]);
    }
  };

  return (
    <FeatureCard
      title="Deduplicate Data"
      description="Remove duplicate rows and merge values within a single file"
      icon="🔄"
    >
      <div className="space-y-4">
        {!selectedFileId ? (
          <p className="text-sm text-amber-600">Please select a file from the uploaded files list above</p>
        ) : (
          <>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-900">
              <p className="font-medium">How it works:</p>
              <ul className="list-disc list-inside mt-1 text-xs">
                <li>Select columns that identify duplicate rows</li>
                <li>Numeric columns will be summed</li>
                <li>Text columns will keep the first value</li>
              </ul>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select columns to identify duplicates:
              </label>
              <div className="space-y-1">
                {columns.map((col: string) => (
                  <label key={col} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={duplicateColumns.includes(col)}
                      onChange={() => toggleColumn(col)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">{col}</span>
                  </label>
                ))}
              </div>
            </div>
            {duplicateColumns.length > 0 && (
              <div className="p-2 bg-gray-50 border border-gray-200 rounded text-xs text-gray-700">
                Rows with same values in: <strong>{duplicateColumns.join(', ')}</strong> will be merged
              </div>
            )}
            <Button
              onClick={() => onDeduplicateMerge(selectedFileId, duplicateColumns)}
              isLoading={isProcessing}
              disabled={duplicateColumns.length === 0}
            >
              Remove Duplicates
            </Button>
          </>
        )}
      </div>
    </FeatureCard>
  );
}

// Feature 5: Data Filtering
function FeatureFilter({ uploadedFiles, selectedFileId, onFilter, isProcessing }: any) {
  const [conditions, setConditions] = useState<FilterCondition[]>([{
    column: '',
    operator: FilterOperator.EQUALS,
    value: ''
  }]);
  const [matchAll, setMatchAll] = useState(true);

  const selectedFile = uploadedFiles.find((f: FileMetadata) => f.file_id === selectedFileId);
  const columns = selectedFile?.preview?.columns || [];

  const addCondition = () => {
    setConditions([...conditions, { column: '', operator: FilterOperator.EQUALS, value: '' }]);
  };

  const removeCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const updateCondition = (index: number, field: keyof FilterCondition, value: any) => {
    const newConditions = [...conditions];
    newConditions[index] = { ...newConditions[index], [field]: value };
    setConditions(newConditions);
  };

  return (
    <FeatureCard title="Data Filtering" description="Filter rows based on conditions" icon="🔍">
      <div className="space-y-4">
        {!selectedFileId ? (
          <p className="text-sm text-amber-600">Please select a file from the uploaded files list above</p>
        ) : (
          <>
            <div>
              <label className="flex items-center gap-2 cursor-pointer mb-3">
                <input
                  type="checkbox"
                  checked={matchAll}
                  onChange={(e) => setMatchAll(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm">Match ALL conditions (AND logic)</span>
              </label>
            </div>
            {conditions.map((condition, index) => (
              <div key={index} className="p-3 border border-gray-300 rounded-lg space-y-2">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Condition {index + 1}</span>
                  {conditions.length > 1 && (
                    <button
                      onClick={() => removeCondition(index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <select
                  value={condition.column}
                  onChange={(e) => updateCondition(index, 'column', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">-- Select Column --</option>
                  {columns.map((col: string) => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
                <select
                  value={condition.operator}
                  onChange={(e) => updateCondition(index, 'operator', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="equals">Equals</option>
                  <option value="not_equals">Not Equals</option>
                  <option value="contains">Contains</option>
                  <option value="not_contains">Not Contains</option>
                  <option value="greater_than">Greater Than</option>
                  <option value="less_than">Less Than</option>
                  <option value="greater_equal">Greater or Equal</option>
                  <option value="less_equal">Less or Equal</option>
                </select>
                <input
                  type="text"
                  value={condition.value}
                  onChange={(e) => updateCondition(index, 'value', e.target.value)}
                  placeholder="Value"
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            ))}
            <Button onClick={addCondition} variant="secondary" size="sm">
              + Add Condition
            </Button>
            <Button
              onClick={() => onFilter(selectedFileId, conditions, matchAll)}
              isLoading={isProcessing}
              disabled={conditions.some(c => !c.column || c.value === '')}
            >
              Apply Filter
            </Button>
          </>
        )}
      </div>
    </FeatureCard>
  );
}

// Feature 6: Column Management
function FeatureColumnManagement({ uploadedFiles, selectedFileId, onRenameColumns, isProcessing }: any) {
  const [renameMap, setRenameMap] = useState<Record<string, string>>({});

  const selectedFile = uploadedFiles.find((f: FileMetadata) => f.file_id === selectedFileId);
  const columns = selectedFile?.preview?.columns || [];

  const handleRename = (oldName: string, newName: string) => {
    setRenameMap(prev => ({ ...prev, [oldName]: newName }));
  };

  const activeRenames = Object.entries(renameMap).filter(([_, newName]) => newName.trim() !== '');

  return (
    <FeatureCard title="Column Management" description="Rename, delete, or reorder columns" icon="📊">
      <div className="space-y-4">
        {!selectedFileId ? (
          <p className="text-sm text-amber-600">Please select a file from the uploaded files list above</p>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rename Columns:</label>
              <div className="space-y-2">
                {columns.map((col: string) => (
                  <div key={col} className="flex items-center gap-2">
                    <span className="text-sm w-1/3 truncate" title={col}>{col}</span>
                    <span className="text-gray-400">→</span>
                    <input
                      type="text"
                      placeholder="New name (optional)"
                      value={renameMap[col] || ''}
                      onChange={(e) => handleRename(col, e.target.value)}
                      className="flex-1 p-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
              {activeRenames.length > 0 ? (
                <span>Will rename {activeRenames.length} column(s)</span>
              ) : (
                <span>Enter new names for columns you want to rename</span>
              )}
            </div>
            <Button
              onClick={() => onRenameColumns(selectedFileId, Object.fromEntries(activeRenames))}
              isLoading={isProcessing}
              disabled={activeRenames.length === 0}
            >
              Rename Columns
            </Button>
          </>
        )}
      </div>
    </FeatureCard>
  );
}

// Feature 7: Search & Replace
function FeatureSearchReplace({ uploadedFiles, selectedFileId, onSearchReplace, isProcessing }: any) {
  const [searchText, setSearchText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);

  const selectedFile = uploadedFiles.find((f: FileMetadata) => f.file_id === selectedFileId);

  return (
    <FeatureCard title="Search & Replace" description="Find and replace text in your data" icon="🔎">
      <div className="space-y-4">
        {!selectedFileId ? (
          <p className="text-sm text-amber-600">Please select a file from the uploaded files list above</p>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search for:</label>
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Text to search"
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Replace with:</label>
              <input
                type="text"
                value={replaceText}
                onChange={(e) => setReplaceText(e.target.value)}
                placeholder="Replacement text"
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={caseSensitive}
                  onChange={(e) => setCaseSensitive(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm">Case sensitive</span>
              </label>
            </div>
            <Button
              onClick={() => onSearchReplace(selectedFileId, searchText, replaceText, null, caseSensitive)}
              isLoading={isProcessing}
              disabled={!searchText}
            >
              Search & Replace
            </Button>
          </>
        )}
      </div>
    </FeatureCard>
  );
}

// Feature 9: Calculated Columns
function FeatureCalculatedColumn({ uploadedFiles, selectedFileId, onAddCalculatedColumn, isProcessing }: any) {
  const [newColumnName, setNewColumnName] = useState('');
  const [formula, setFormula] = useState('');

  const selectedFile = uploadedFiles.find((f: FileMetadata) => f.file_id === selectedFileId);
  const columns = selectedFile?.preview?.columns || [];

  return (
    <FeatureCard title="Calculated Columns" description="Create new columns using formulas" icon="∑">
      <div className="space-y-4">
        {!selectedFileId ? (
          <p className="text-sm text-amber-600">Please select a file from the uploaded files list above</p>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">New Column Name:</label>
              <input
                type="text"
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
                placeholder="e.g., Total"
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Formula:</label>
              <textarea
                value={formula}
                onChange={(e) => setFormula(e.target.value)}
                placeholder="e.g., Price * Quantity"
                rows={3}
                className="w-full p-2 border border-gray-300 rounded-lg font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                Available columns: {columns.join(', ')}
              </p>
              <p className="text-xs text-gray-500">
                Example: Price * Quantity, Column1 + Column2
              </p>
            </div>
            <Button
              onClick={() => onAddCalculatedColumn(selectedFileId, newColumnName, formula)}
              isLoading={isProcessing}
              disabled={!newColumnName || !formula}
            >
              Add Calculated Column
            </Button>
          </>
        )}
      </div>
    </FeatureCard>
  );
}
