import React, { useState, useEffect } from 'react';
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
  const showWatanyaExport = (filters.company === 'Watanya' || 
                           (filters.companies && filters.companies.includes('Watanya'))) &&
                           hasPermission; // Only show if user has permission level 3+

  return (
    <div>
      {/* Show Watanya export button if the company is Watanya and user has permission */}
      {showWatanyaExport && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          marginBottom: isMobile ? '8px' : '16px',
          marginTop: '8px'
        }}>
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