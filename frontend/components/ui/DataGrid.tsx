// Simple Data Grid Component for Excel Preview
'use client';

import React from 'react';

interface DataGridProps {
    columns: string[];
    data: Record<string, any>[];
    maxHeight?: string;
}

export function DataGrid({ columns, data, maxHeight = '400px' }: DataGridProps) {
    return (
        <div className="w-full border border-gray-300 rounded-lg overflow-hidden">
            <div className="overflow-auto" style={{ maxHeight }}>
                <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-primary text-white sticky top-0 z-10">
                        <tr>
                            {columns.map((col, idx) => (
                                <th
                                    key={idx}
                                    className="px-4 py-3 text-left text-sm font-semibold"
                                >
                                    {col}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {data.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={columns.length}
                                    className="px-4 py-8 text-center text-gray-500"
                                >
                                    No data available
                                </td>
                            </tr>
                        ) : (
                            data.map((row, rowIdx) => (
                                <tr key={rowIdx} className="hover:bg-gray-50">
                                    {columns.map((col, colIdx) => (
                                        <td key={colIdx} className="px-4 py-2 text-sm text-gray-900 whitespace-nowrap">
                                            {row[col] !== null && row[col] !== undefined ? String(row[col]) : ''}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
