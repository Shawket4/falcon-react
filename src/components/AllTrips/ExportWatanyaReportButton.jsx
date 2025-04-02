import React, { useState } from 'react';
import apiClient from '../../apiClient'; // Update path based on your folder structure

const ExportWatanyaReportButton = ({ filters }) => {
  const [loading, setLoading] = useState(false);

  const handleExportReport = async () => {
    setLoading(true);
    try {
      // Extract start_date and end_date from filters
      const requestData = {
        start_date: filters.startDate || filters.date,
        end_date: filters.endDate || filters.date
      };

      // Make API request using apiClient
      const response = await apiClient({
        url: '/api/trips/watanya/export_report',
        method: 'POST',
        data: requestData,
        responseType: 'blob', // Important for file downloads
      });

      // Create a URL for the blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      
      // Create temporary link element to trigger download
      const link = document.createElement('a');
      link.href = url;
      
      // Get filename from response header or use default
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'watanya_report.xlsx';
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]*)"?/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error exporting Watanya report:', error);
      alert('Failed to download report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative" title="Export Watanya Trips Report">
      <button
        onClick={handleExportReport}
        disabled={loading}
        className={`flex items-center px-3 py-2 rounded-lg text-xs font-medium bg-blue-500 text-white hover:bg-blue-600 transition duration-200 shadow-sm ${
          loading ? 'opacity-70 cursor-not-allowed' : ''
        }`}
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
            Exporting...
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export Watanya Report
          </>
        )}
      </button>
    </div>
  );
};

export default ExportWatanyaReportButton;