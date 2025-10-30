import type {
  Institution,
  InstitutionDetail,
  InstitutionCreateInput,
  InstitutionUpdateInput,
} from './types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const api = {
  async listInstitutions(): Promise<Institution[]> {
    const response = await fetch(`${API_BASE_URL}/api/institutions`);
    if (!response.ok) {
      throw new Error('Failed to fetch institutions');
    }
    return response.json();
  },

  async getInstitution(id: string): Promise<InstitutionDetail> {
    const response = await fetch(`${API_BASE_URL}/api/institutions/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch institution');
    }
    return response.json();
  },

  async createInstitution(data: InstitutionCreateInput): Promise<Institution> {
    const response = await fetch(`${API_BASE_URL}/api/institutions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to create institution');
    }
    return response.json();
  },

  async updateInstitution(
    id: string,
    data: InstitutionUpdateInput
  ): Promise<Institution> {
    const response = await fetch(`${API_BASE_URL}/api/institutions/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to update institution');
    }
    return response.json();
  },

  async deleteInstitution(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/institutions/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to delete institution');
    }
  },
};
