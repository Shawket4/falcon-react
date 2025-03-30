import React from 'react';
import TripStatistics from './TripStatistics';
import MobileTripStatistics from './MobileTripStats';

const ResponsiveTripStatistics = ({ filters }) => {
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

  // Render appropriate component based on screen size
  return isMobile ? (
    <MobileTripStatistics filters={filters} />
  ) : (
    <TripStatistics filters={filters} />
  );
};

export default ResponsiveTripStatistics;