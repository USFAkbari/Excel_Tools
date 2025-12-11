// API client for Excel Tools backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export class ApiClient {
    private baseURL: string;

    constructor(baseURL: string = API_BASE_URL) {
        this.baseURL = baseURL;
    }

    async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
        const url = `${this.baseURL}${endpoint}`;

        const response = await fetch(url, {
            ...options,
            headers: {
                ...options?.headers,
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));

            // Handle validation errors (422) which return array of details
            let errorMessage = errorData.detail;
            if (Array.isArray(errorMessage)) {
                errorMessage = errorMessage.map((e: any) => `${e.loc.join('.')}: ${e.msg}`).join(', ');
            } else if (typeof errorMessage === 'object') {
                errorMessage = JSON.stringify(errorMessage);
            }

            throw new Error(errorMessage || `HTTP error! status: ${response.status}`);
        }

        return response.json();
    }

    // File Upload
    async uploadFile(file: File) {
        const formData = new FormData();
        formData.append('file', file);

        return this.fetch('/api/upload', {
            method: 'POST',
            body: formData,
        });
    }

    // File Preview
    async previewFile(fileId: string, maxRows: number = 50) {
        return this.fetch(`/api/preview/${fileId}?max_rows=${maxRows}`);
    }

    // Generic POST request
    async post<T>(endpoint: string, data: any): Promise<T> {
        return this.fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
    }

    // ============= Feature 1: File Merge =============
    async mergeFiles(fileIds: string[]) {
        return this.post('/api/merge', { file_ids: fileIds });
    }

    // ============= Feature 2: Deduplicate & Merge =============
    async deduplicateMerge(fileId: string, duplicateColumns: string[]) {
        return this.post('/api/deduplicate-merge', {
            file_id: fileId,
            duplicate_columns: duplicateColumns
        });
    }

    // ============= Feature 3: Sort Data =============
    async sortData(fileId: string, column: string, order: 'asc' | 'desc') {
        return this.post('/api/sort', { file_id: fileId, column, order });
    }

    // ============= Feature 4: Number Normalization =============
    async normalizeNumbers(fileId: string, direction: string, columns?: string[] | null) {
        return this.post('/api/normalize-numbers', {
            file_id: fileId,
            direction,
            columns
        });
    }

    // ============= Feature 5: Data Filtering =============
    async filterData(fileId: string, conditions: any[], matchAll: boolean) {
        return this.post('/api/filter', {
            file_id: fileId,
            conditions,
            match_all: matchAll
        });
    }

    // ============= Feature 6: Column Management =============
    async renameColumns(fileId: string, renameMap: Record<string, string>) {
        return this.post('/api/columns/rename', {
            file_id: fileId,
            rename_map: renameMap
        });
    }

    async deleteColumns(fileId: string, columns: string[]) {
        return this.post('/api/columns/delete', {
            file_id: fileId,
            columns
        });
    }

    async reorderColumns(fileId: string, columnOrder: string[]) {
        return this.post('/api/columns/reorder', {
            file_id: fileId,
            column_order: columnOrder
        });
    }

    // ============= Feature 7: Search & Replace =============
    async searchReplace(fileId: string, searchText: string, replaceText: string, columns?: string[] | null, caseSensitive: boolean = false) {
        return this.post('/api/search-replace', {
            file_id: fileId,
            search_text: searchText,
            replace_text: replaceText,
            columns,
            case_sensitive: caseSensitive
        });
    }

    // ============= Feature 8: Type Conversion =============
    async convertTypes(fileId: string, conversions: Array<{ column: string; target_type: string }>) {
        const conversionMap: Record<string, string> = {};
        conversions.forEach(c => {
            conversionMap[c.column] = c.target_type;
        });

        return this.post('/api/convert-types', {
            file_id: fileId,
            conversions: conversionMap
        });
    }

    // ============= Feature 9: Calculated Columns =============
    async addCalculatedColumn(fileId: string, newColumnName: string, formula: string) {
        return this.post('/api/calculated-column', {
            file_id: fileId,
            new_column_name: newColumnName,
            formula
        });
    }

    // ============= Feature 10: Split Data =============
    async splitData(fileId: string, method: string, splitColumn?: string, rowsPerFile?: number) {
        return this.post('/api/split', {
            file_id: fileId,
            method,
            column: splitColumn,
            row_count: rowsPerFile
        });
    }

    // Download file (for future use)
    getDownloadUrl(fileId: string): string {
        return `${this.baseURL}/api/download/${fileId}`;
    }
}

export const apiClient = new ApiClient();
