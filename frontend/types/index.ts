// TypeScript types for the Excel Tools application
export interface FileResponse {
    file_id: string;
    message?: string;
    filename?: string;
}

export interface PreviewResponse {
    file_id: string;
    columns: string[];
    data: Record<string, any>[];
    total_rows: number;
    preview_rows: number;
}

export interface OperationResponse {
    file_id: string;
    message: string;
    [key: string]: any;
}

export interface FilterCondition {
    column: string;
    operator: string;
    value: string | number;
}

export type NormalizationDirection = "persian_to_english" | "english_to_persian";
export type SortOrder = "asc" | "desc";
export type SplitMethod = "by_column" | "by_row_count";
