// File: components/trips/Pagination.jsx
import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight, 
  MoreHorizontal,
  Settings2,
  X
} from 'lucide-react';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  total = 0, 
  limit = 10, 
  onPageChange, 
  onLimitChange,
  isLoading = false 
}) => {
  const [jumpToPage, setJumpToPage] = useState('');
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Limit options
  const limitOptions = [10, 25, 50, 100];

  // Calculate showing range
  const startItem = total > 0 ? ((currentPage - 1) * limit) + 1 : 0;
  const endItem = Math.min(currentPage * limit, total);

  // Enhanced page numbers calculation with ellipsis
  const getPageNumbers = () => {
    const result = [];
    const showEllipsis = totalPages > 7;
    
    if (!showEllipsis) {
      // Show all pages if total pages <= 7
      for (let i = 1; i <= totalPages; i++) {
        result.push(i);
      }
    } else if (currentPage <= 4) {
      // At the beginning
      for (let i = 1; i <= 5; i++) {
        result.push(i);
      }
      result.push('ellipsis');
      result.push(totalPages);
    } else if (currentPage >= totalPages - 3) {
      // At the end
      result.push(1);
      result.push('ellipsis');
      for (let i = totalPages - 4; i <= totalPages; i++) {
        result.push(i);
      }
    } else {
      // In the middle
      result.push(1);
      result.push('ellipsis');
      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
        result.push(i);
      }
      result.push('ellipsis');
      result.push(totalPages);
    }
    
    return result;
  };

  // Mobile version - show fewer pages
  const getMobilePageNumbers = () => {
    const result = [];
    
    if (totalPages <= 3) {
      for (let i = 1; i <= totalPages; i++) {
        result.push(i);
      }
    } else if (currentPage === 1) {
      result.push(1, 2, 'ellipsis', totalPages);
    } else if (currentPage === totalPages) {
      result.push(1, 'ellipsis', totalPages - 1, totalPages);
    } else {
      result.push(1, 'ellipsis', currentPage, 'ellipsis', totalPages);
    }
    
    return result;
  };

  const pageNumbers = getPageNumbers();
  const mobilePageNumbers = getMobilePageNumbers();

  // Handle jump to page
  const handleJumpToPage = () => {
    const pageNumber = parseInt(jumpToPage, 10);
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      onPageChange(pageNumber);
      setJumpToPage('');
      setShowMobileMenu(false);
    }
  };

  const handleJumpInputKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleJumpToPage();
    } else if (e.key === 'Escape') {
      setJumpToPage('');
      setShowMobileMenu(false);
    }
  };

  // Handle limit change
  const handleLimitChange = (newLimit) => {
    if (onLimitChange) {
      onLimitChange(newLimit);
      setShowMobileMenu(false);
    }
  };

  if (totalPages <= 1) {
    return null; // Don't show pagination if only one page or no pages
  }

  return (
    <>
      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 sm:hidden">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-medium text-gray-900">Pagination Options</h3>
              <button
                onClick={() => setShowMobileMenu(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              {/* Jump to page */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jump to page (1-{totalPages})
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    min="1"
                    max={totalPages}
                    value={jumpToPage}
                    onChange={(e) => setJumpToPage(e.target.value)}
                    onKeyDown={handleJumpInputKeyPress}
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Page number"
                  />
                  <button
                    onClick={handleJumpToPage}
                    disabled={!jumpToPage || isLoading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    Go
                  </button>
                </div>
              </div>

              {/* Items per page */}
              {onLimitChange && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Items per page
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {limitOptions.map(option => (
                      <button
                        key={option}
                        onClick={() => handleLimitChange(option)}
                        disabled={isLoading}
                        className={`py-2 px-4 rounded-md border text-sm font-medium ${
                          limit === option
                            ? 'bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick jump buttons */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quick jump
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      onPageChange(1);
                      setShowMobileMenu(false);
                    }}
                    disabled={currentPage === 1 || isLoading}
                    className="py-2 px-4 rounded-md border border-gray-300 text-sm font-medium bg-white text-gray-700 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                  >
                    First page
                  </button>
                  <button
                    onClick={() => {
                      onPageChange(totalPages);
                      setShowMobileMenu(false);
                    }}
                    disabled={currentPage === totalPages || isLoading}
                    className="py-2 px-4 rounded-md border border-gray-300 text-sm font-medium bg-white text-gray-700 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                  >
                    Last page
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col space-y-4 mt-6">
        {/* Results info - always visible */}
        <div className="text-center sm:text-left text-sm text-gray-700">
          Showing <span className="font-medium">{startItem}</span> to{' '}
          <span className="font-medium">{endItem}</span> of{' '}
          <span className="font-medium">{total}</span> results
        </div>

        {/* Desktop pagination */}
        <div className="hidden sm:flex justify-between items-center">
          {/* Per page selector - Desktop */}
          {onLimitChange && (
            <div className="flex items-center space-x-2">
              <label htmlFor="limit-select" className="text-sm text-gray-700 whitespace-nowrap">
                Per page:
              </label>
              <select
                id="limit-select"
                value={limit}
                onChange={(e) => handleLimitChange(parseInt(e.target.value, 10))}
                disabled={isLoading}
                className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              >
                {limitOptions.map(option => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center space-x-4">
            {/* Jump to page - Desktop */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">Jump to:</span>
              <input
                type="number"
                min="1"
                max={totalPages}
                value={jumpToPage}
                onChange={(e) => setJumpToPage(e.target.value)}
                onKeyDown={handleJumpInputKeyPress}
                className="w-16 text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Page"
              />
              <button
                onClick={handleJumpToPage}
                disabled={!jumpToPage || isLoading}
                className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:bg-gray-400"
              >
                Go
              </button>
            </div>

            {/* Pagination navigation - Desktop */}
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              {/* First page button */}
              <button
                onClick={() => onPageChange(1)}
                disabled={currentPage === 1 || isLoading}
                className={`relative inline-flex items-center px-2 py-2 rounded-l-md border text-sm font-medium ${
                  currentPage === 1 || isLoading
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-white text-gray-500 hover:bg-gray-50 border-gray-300'
                }`}
                title="First page"
              >
                <ChevronsLeft className="h-4 w-4" />
              </button>

              {/* Previous page button */}
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1 || isLoading}
                className={`relative inline-flex items-center px-2 py-2 border text-sm font-medium ${
                  currentPage === 1 || isLoading
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-white text-gray-500 hover:bg-gray-50 border-gray-300'
                }`}
                title="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              {/* Page number buttons */}
              {pageNumbers.map((number, index) => (
                number === 'ellipsis' ? (
                  <span
                    key={`ellipsis-${index}`}
                    className="relative inline-flex items-center px-3 py-2 border border-gray-300 bg-white text-sm text-gray-500"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </span>
                ) : (
                  <button
                    key={number}
                    onClick={() => onPageChange(number)}
                    disabled={isLoading}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      currentPage === number
                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50 disabled:bg-gray-100'
                    }`}
                  >
                    {number}
                  </button>
                )
              ))}
              
              {/* Next page button */}
              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages || isLoading}
                className={`relative inline-flex items-center px-2 py-2 border text-sm font-medium ${
                  currentPage === totalPages || isLoading
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-white text-gray-500 hover:bg-gray-50 border-gray-300'
                }`}
                title="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>

              {/* Last page button */}
              <button
                onClick={() => onPageChange(totalPages)}
                disabled={currentPage === totalPages || isLoading}
                className={`relative inline-flex items-center px-2 py-2 rounded-r-md border text-sm font-medium ${
                  currentPage === totalPages || isLoading
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-white text-gray-500 hover:bg-gray-50 border-gray-300'
                }`}
                title="Last page"
              >
                <ChevronsRight className="h-4 w-4" />
              </button>
            </nav>
          </div>
        </div>

        {/* Mobile pagination */}
        <div className="flex sm:hidden justify-between items-center">
          {/* Mobile options button */}
          <button
            onClick={() => setShowMobileMenu(true)}
            className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
          >
            <Settings2 className="h-4 w-4" />
            <span className="text-sm">Options</span>
          </button>

          {/* Mobile pagination navigation */}
          <div className="flex items-center space-x-1">
            {/* Previous */}
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1 || isLoading}
              className={`p-2 rounded border ${
                currentPage === 1 || isLoading
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-white text-gray-500 hover:bg-gray-50 border-gray-300'
              }`}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {/* Mobile page numbers */}
            {mobilePageNumbers.map((number, index) => (
              number === 'ellipsis' ? (
                <span key={`mobile-ellipsis-${index}`} className="px-2 text-gray-400">
                  <MoreHorizontal className="h-4 w-4" />
                </span>
              ) : (
                <button
                  key={`mobile-${number}`}
                  onClick={() => onPageChange(number)}
                  disabled={isLoading}
                  className={`px-3 py-2 rounded border text-sm font-medium min-w-[2.5rem] ${
                    currentPage === number
                      ? 'bg-blue-50 border-blue-500 text-blue-600'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {number}
                </button>
              )
            ))}

            {/* Next */}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages || isLoading}
              className={`p-2 rounded border ${
                currentPage === totalPages || isLoading
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-white text-gray-500 hover:bg-gray-50 border-gray-300'
              }`}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Pagination;