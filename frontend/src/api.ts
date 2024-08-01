// src/api.ts

const BASE_URL = 'http://127.0.0.1:5000'; // Adjust if needed

export async function generateReport(): Promise<{ reportId: string }> {
    const response = await fetch(`${BASE_URL}/generate`);
    if (!response.ok) {
        throw new Error('Failed to generate report');
    }
    return response.json();
}

export async function downloadReport(reportId: string): Promise<{ status: string, data?: any }> {
    const response = await fetch(`${BASE_URL}/download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId })
    });
    if (!response.ok) {
        throw new Error('Failed to download report');
    }
    return response.json();
}
