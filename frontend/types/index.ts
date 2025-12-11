// TypeScript types for the Excel Tools application

// ============= File Management =============
export interface FileResponse {
    file_id: string;
    message?: string;
    filename?: string;
}

export interface FileMetadata {
    file_id: string;
    filename: string;
    preview?: PreviewResponse;
}

export interface PreviewResponse {
    file_id: string;
    columns: string[];
    data: Record<string, any>[];
    total_rows: number;
    preview_rows: number;
}

// ============= Enums =============
export enum FilterOperator {
    EQUALS = "equals",
    NOT_EQUALS = "not_equals",
    CONTAINS = "contains",
    NOT_CONTAINS = "not_contains",
    GREATER_THAN = "greater_than",
    LESS_THAN = "less_than",
    GREATER_EQUAL = "greater_equal",
    LESS_EQUAL = "less_equal"
}

export enum NormalizationDirection {
    PERSIAN_TO_ENGLISH = "persian_to_english",
    ENGLISH_TO_PERSIAN = "english_to_persian"
}

export enum SortOrder {
    ASCENDING = "asc",
    DESCENDING = "desc"
}

export enum SplitMethod {
    BY_COLUMN = "by_column",
    BY_ROW_COUNT = "by_row_count"
}

// ============= Feature 1: File Merge =============
export interface FileMergeRequest {
    file_ids: string[];
}

export interface FileMergeResponse {
    file_id: string;
    files_merged: number;
    total_rows: number;
    message: string;
}

// ============= Feature 2: Deduplicate & Merge =============
export interface DeduplicateMergeRequest {
    file_ids: string[];
    key_column: string;
    value_columns: string[];
}

export interface DeduplicateMergeResponse {
    file_id: string;
    files_merged: number;
    total_rows: number;
    duplicates_removed: number;
    message: string;
}

// ============= Feature 3: Sort Data =============
export interface SortDataRequest {
    file_id: string;
    column: string;
    order: SortOrder;
}

export interface SortDataResponse {
    file_id: string;
    sorted_by: string;
    order: string;
    message: string;
}

// ============= Feature 4: Number Normalization =============
export interface NumberNormalizationRequest {
    file_id: string;
    columns?: string[] | null;
    direction: NormalizationDirection;
}

export interface NumberNormalizationResponse {
    file_id: string;
    columns_processed: number;
    message: string;
}

// ============= Feature 5: Data Filtering =============
export interface FilterCondition {
    column: string;
    operator: FilterOperator;
    value: string | number;
}

export interface DataFilteringRequest {
    file_id: string;
    conditions: FilterCondition[];
    match_all: boolean;
}

export interface DataFilteringResponse {
    file_id: string;
    original_rows: number;
    filtered_rows: number;
    message: string;
}

// ============= Feature 6: Column Management =============
export interface RenameColumnsRequest {
    file_id: string;
    rename_map: Record<string, string>;
}

export interface DeleteColumnsRequest {
    file_id: string;
    columns: string[];
}

export interface ReorderColumnsRequest {
    file_id: string;
    column_order: string[];
}

export interface ColumnManagementResponse {
    file_id: string;
    message: string;
}

// ============= Feature 7: Search & Replace =============
export interface SearchReplaceRequest {
    file_id: string;
    columns?: string[] | null;
    search_text: string;
    replace_text: string;
    case_sensitive: boolean;
}

export interface SearchReplaceResponse {
    file_id: string;
    replacements_made: number;
    message: string;
}

// ============= Feature 8: Type Conversion =============
export interface ColumnTypeConversion {
    column: string;
    target_type: string;
}

export interface TypeConversionRequest {
    file_id: string;
    conversions: ColumnTypeConversion[];
}

export interface TypeConversionResponse {
    file_id: string;
    conversions_applied: number;
    message: string;
}

// ============= Feature 9: Calculated Columns =============
export interface CalculatedColumnRequest {
    file_id: string;
    new_column_name: string;
    formula: string;
}

export interface CalculatedColumnResponse {
    file_id: string;
    new_column: string;
    message: string;
}

// ============= Feature 10: Split Data =============
export interface SplitDataRequest {
    file_id: string;
    method: SplitMethod;
    split_column?: string;
    rows_per_file?: number;
}

export interface SplitDataResponse {
    file_ids: string[];
    files_created: number;
    message: string;
}

