// File: components/trips/Pagination.jsx
import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  // Calculate which page numbers to show
  const getPageNumbers = () => {
    const result = [];
    
    if (totalPages <= 5) {
      // Show all pages if total pages <= 5
      for (let i = 1; i <= totalPages; i++) {
        result.push(i);
      }
    } else if (currentPage <= 3) {
      // At the beginning, show first 5 pages
      for (let i = 1; i <= 5; i++) {
        result.push(i);
      }
    } else if (currentPage >= totalPages - 2) {
      // At the end, show last 5 pages
      for (let i = totalPages - 4; i <= totalPages; i++) {
        result.push(i);
      }
    } else {
      // In the middle, show current page and 2 pages on each side
      for (let i = currentPage - 2; i <= currentPage + 2; i++) {
        result.push(i);
      }
    }
    
    return result;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex justify-center mt-4 sm:mt-6">
      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
        {/* Previous page button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`relative inline-flex items-center px-2 py-2 rounded-l-md border text-sm font-medium ${
            currentPage === 1 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-white text-gray-500 hover:bg-gray-50'
          }`}
        >
          <span className="sr-only">Previous</span>
          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </button>
        
        {/* Page number buttons */}
        {pageNumbers.map(number => (
          <button
            key={number}
            onClick={() => onPageChange(number)}
            className={`relative inline-flex items-center px-3 sm:px-4 py-2 border text-sm font-medium ${
              currentPage === number
                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
            }`}
          >
            {number}
          </button>
        ))}
        
        {/* Next page button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`relative inline-flex items-center px-2 py-2 rounded-r-md border text-sm font-medium ${
            currentPage === totalPages 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-white text-gray-500 hover:bg-gray-50'
          }`}
        >
          <span className="sr-only">Next</span>
          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      </nav>
    </div>
  );
};

export default Pagination;