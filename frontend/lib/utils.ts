// Utility functions
import { type ClassValue, clsx } from "clsx"

export function cn(...inputs: ClassValue[]) {
    return clsx(inputs)
}

export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

export function downloadFile(fileId: string, filename: string = 'download.xlsx') {
    const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/download/${fileId}`;
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}
