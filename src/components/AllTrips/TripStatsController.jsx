import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import TripStatistics from './TripStatistics';
import MobileTripStatistics from './MobileTripStats';
import ExportWatanyaReportButton from './ExportWatanyaReportButton';
import MobileExportButton from './MobileExportButtonWatanya';

const ResponsiveTripStatistics = ({ filters }) => {
  const [hasPermission, setHasPermission] = useState(false);
  
  // Check permission level on component mount
  useEffect(() => {
    const permission = localStorage.getItem('permission');
    // Check if user has permission level 3 or higher
    setHasPermission(permission && parseInt(permission) >= 3);
  }, []);

  // Custom hook for tracking screen size
  const useMediaQuery = (query) => {
    const [matches, setMatches] = React.useState(false);
    React.useEffect(() => {
      const media = window.matchMedia(query);
      if (media.matches !== matches) {
        setMatches(media.matches);
      }
      const listener = () => setMatches(media.matches);
      media.addListener(listener);
      return () => media.removeListener(listener);
    }, [query, matches]);
    return matches;
  };
  
  // Check if screen is mobile (adjust breakpoint as needed)
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  // Check if Watanya is selected in filters
  const showWatanyaOptions = (filters.company === 'Watanya' || 
                           (filters.companies && filters.companies.includes('Watanya'))) &&
                           hasPermission; // Only show if user has permission level 3+

  return (
    <div>
      {/* Show Watanya options if the company is Watanya and user has permission */}
      {showWatanyaOptions && (
        <div className="flex flex-wrap justify-end items-center gap-3 mt-2 mb-4">
          {/* Driver Analytics Link */}
          <Link 
            to={{
              pathname: "/driver-analytics",
              search: filters.startDate && filters.endDate ? 
                `?start_date=${filters.startDate}&end_date=${filters.endDate}` : ""
            }}
            className={`
              flex items-center px-3 py-2 rounded-lg text-xs font-medium 
              bg-green-500 text-white hover:bg-green-600 transition duration-200 shadow-sm
            `}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Driver Analytics
          </Link>
          
          {/* Export Button */}
          {isMobile ? (
            <MobileExportButton filters={filters} />
          ) : (
            <ExportWatanyaReportButton filters={filters} />
          )}
        </div>
      )}
      
      {/* Render appropriate statistics component based on screen size */}
      {isMobile ? (
        <MobileTripStatistics filters={filters} />
      ) : (
        <TripStatistics filters={filters} />
      )}
    </div>
  );
};

export default ResponsiveTripStatistics;