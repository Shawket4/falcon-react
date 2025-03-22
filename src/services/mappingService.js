// src/services/mappingService.js
import apiClient from '../apiClient';

// Distance Mapping API Services
export const distanceService = {
  // Get all distance mappings
  getAllDistanceMappings: async () => {
    try {
      const response = await apiClient.get('/api/distances/');
      return response.data;
    } catch (error) {
      console.error('Error fetching distance mappings:', error);
      throw error;
    }
  },

  // Create a new distance mapping
  createDistanceMapping: async (mappingData) => {
    try {
      const response = await apiClient.post('/api/distances/', mappingData);
      return response.data;
    } catch (error) {
      console.error('Error creating distance mapping:', error);
      throw error;
    }
  },

  // Update an existing distance mapping
  updateDistanceMapping: async (mappingData) => {
    try {
      const response = await apiClient.put('/api/distances/', mappingData);
      return response.data;
    } catch (error) {
      console.error('Error updating distance mapping:', error);
      throw error;
    }
  }
};

// Fee Mapping API Services
export const feeService = {
  // Get all fee mappings, optionally filtered by company
  getAllFeeMappings: async (company = '') => {
    try {
      const response = await apiClient.get('/api/fees/', {
        params: { company }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching fee mappings:', error);
      throw error;
    }
  },

  // Create a new fee mapping
  createFeeMapping: async (mappingData) => {
    try {
      const response = await apiClient.post('/api/fees/', mappingData);
      return response.data;
    } catch (error) {
      console.error('Error creating fee mapping:', error);
      throw error;
    }
  },

  // Update an existing fee mapping
  updateFeeMapping: async (mappingData) => {
    try {
      const response = await apiClient.put('/api/fees/', mappingData);
      return response.data;
    } catch (error) {
      console.error('Error updating fee mapping:', error);
      throw error;
    }
  },

  // Delete a fee mapping
  deleteFeeMapping: async (mappingData) => {
    try {
      const response = await apiClient.delete('/api/fees/', { data: mappingData });
      return response.data;
    } catch (error) {
      console.error('Error deleting fee mapping:', error);
      throw error;
    }
  }
};