import { Portfolio } from '@/lib/types';
import { getSession } from 'next-auth/react';

// PASTIKAN API_URL hanya sampai port saja, misal: http://localhost:5000
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const IMAGE_BASE_URL = `${API_URL}/uploads/`;

const getAuthHeaders = async (): Promise<Record<string, string>> => {
    const session = await getSession();
    const token = (session as any)?.accessToken;
    return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const portfolioService = {
    getAllPortfolios: async (): Promise<Portfolio[]> => {
        const headers = await getAuthHeaders();
        // Gunakan /api/portfolio (pastikan tidak dobel di .env)
        const response = await fetch(`${API_URL}/portfolio/shown`, { headers });
        const data = await response.json();
        return (data.data || []);
    },

    createPortfolio: async (payload: FormData): Promise<Portfolio> => {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_URL}/portfolio`, {
            method: 'POST',
            headers: { ...headers }, // JANGAN tambahkan Content-Type: application/json
            body: payload, // Kirim langsung FormData, JANGAN di-stringify
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Gagal membuat portfolio');
        return data.data;
    },

    updatePortfolio: async (id: string, payload: FormData | any): Promise<Portfolio> => {
        const headers = await getAuthHeaders();
        const isFormData = payload instanceof FormData;

        const response = await fetch(`${API_URL}/portfolio/${id}`, {
            method: 'PUT',
            headers: isFormData ? headers : { ...headers, 'Content-Type': 'application/json' },
            body: isFormData ? payload : JSON.stringify(payload),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Gagal update');
        return data.data;
    },
    
    deletePortfolio: async (id: string): Promise<void> => {
        try {
            const headers = await getAuthHeaders();
            const response = await fetch(`${API_URL}/portfolio/${id}`, {
                method: 'DELETE',
                headers,
            });

            if (!response.ok) throw new Error('Failed to delete portfolio');
        } catch (error) {
            console.error('Error deleting portfolio:', error);
            throw error;
        }
    }

};
    