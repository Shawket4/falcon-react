import React from 'react';
import { 
  DollarSign, 
  CreditCard, 
  Calculator, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight 
} from 'lucide-react';

const GlobalStats = ({ stats, formatCurrency }) => {
  // Ensure we have stats or provide defaults
  const data = stats || {
    total_loans: 0,
    total_amount: 0,
    average_amount: 0,
    median_amount: 0,
    min_amount: 0,
    max_amount: 0,
    period_days: 0,
    growth_rate: 0
  };

  // Helper function to format numbers
  const formatNumber = (num) => {
    if (num === null || num === undefined) return '0';
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 1
    }).format(num);
  };

  // Format values for display based on screen size
  const formatValue = (value, type) => {
    if (value === null || value === undefined) return '0';
    
    if (type === 'currency') {
      // For smaller screens, abbreviate thousands/millions
      return (
        <>
          <span className="hidden xs:inline">{formatCurrency(value)}</span>
          <span className="xs:hidden">
            {value >= 1000000 
              ? '$' + (value / 1000000).toFixed(1) + 'M'
              : value >= 1000 
                ? '$' + (value / 1000).toFixed(1) + 'K' 
                : formatCurrency(value)}
          </span>
        </>
      );
    }
    
    return (
      <>
        <span className="hidden xs:inline">{formatNumber(value)}</span>
        <span className="xs:hidden">
          {value >= 1000000 
            ? (value / 1000000).toFixed(1) + 'M'
            : value >= 1000 
              ? (value / 1000).toFixed(1) + 'K' 
              : formatNumber(value)}
        </span>
      </>
    );
  };

  // Growth indicator component
  const GrowthIndicator = ({ value }) => {
    if (value === undefined || value === null) return null;
    
    const isPositive = value >= 0;
    const formattedValue = Math.abs(value).toFixed(1);
    
    return (
      <div className="flex items-center text-2xs xs:text-xs">
        <span className={`flex items-center font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive 
            ? <ArrowUpRight size={12} className="mr-0.5" />
            : <ArrowDownRight size={12} className="mr-0.5" />
          }
          {formattedValue}% 
        </span>
        <span className="text-gray-500 ml-0.5 xs:ml-1 whitespace-nowrap">
          <span className="hidden xs:inline">vs previous</span>
          <span className="xs:hidden">↔</span>
        </span>
      </div>
    );
  };

  // Stats cards configuration
  const statsCards = [
    {
      id: 'total-loans',
      title: 'Total Loans',
      value: data.total_loans,
      valueType: 'number',
      subtitle: data.period_days ? (
        <>
          <span className="hidden xs:inline">{formatNumber(data.total_loans / data.period_days)}/day</span>
          <span className="xs:hidden">{formatNumber(data.total_loans / data.period_days)}×</span>
        </>
      ) : 'No data',
      icon: <CreditCard className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6" />,
      color: 'blue'
    },
    {
      id: 'total-amount',
      title: 'Total Amount',
      value: data.total_amount,
      valueType: 'currency',
      growth: data.growth_rate,
      icon: <DollarSign className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6" />,
      color: 'green'
    },
    {
      id: 'average',
      title: 'Avg / Med',
      value: data.average_amount,
      valueType: 'currency',
      subtitle: (
        <>
          <span className="hidden xs:inline">Med: {formatCurrency(data.median_amount)}</span>
          <span className="xs:hidden">M: {data.median_amount >= 1000 ? '$' + (data.median_amount/1000).toFixed(1) + 'k' : formatCurrency(data.median_amount)}</span>
        </>
      ),
      icon: <Calculator className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6" />,
      color: 'purple'
    },
    {
      id: 'min-max',
      title: 'Min / Max',
      value: data.min_amount,
      valueType: 'currency',
      subtitle: (
        <>
          <span className="hidden xs:inline">Max: {formatCurrency(data.max_amount)}</span>
          <span className="xs:hidden">Max: {data.max_amount >= 1000 ? '$' + (data.max_amount/1000).toFixed(1) + 'k' : formatCurrency(data.max_amount)}</span>
        </>
      ),
      icon: <TrendingUp className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6" />,
      color: 'amber'
    }
  ];

  // Color mappings
  const colorMap = {
    blue: {
      bg: 'bg-blue-100',
      hoverBg: 'hover:bg-blue-50',
      text: 'text-blue-600',
      border: 'border-blue-200',
      gradient: 'from-blue-500 to-blue-400'
    },
    green: {
      bg: 'bg-green-100',
      hoverBg: 'hover:bg-green-50',
      text: 'text-green-600',
      border: 'border-green-200',
      gradient: 'from-green-500 to-green-400'
    },
    purple: {
      bg: 'bg-purple-100',
      hoverBg: 'hover:bg-purple-50',
      text: 'text-purple-600',
      border: 'border-purple-200',
      gradient: 'from-purple-500 to-purple-400'
    },
    amber: {
      bg: 'bg-amber-100',
      hoverBg: 'hover:bg-amber-50',
      text: 'text-amber-600',
      border: 'border-amber-200',
      gradient: 'from-amber-500 to-amber-400'
    }
  };

  return (
    <div className="bg-white p-2.5 xs:p-3 sm:p-4 lg:p-5 rounded-lg sm:rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-sm xs:text-base sm:text-lg font-semibold text-gray-800 mb-2 xs:mb-3 sm:mb-4">Summary Statistics</h3>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-1.5 xs:gap-2 sm:gap-3 lg:gap-4">
        {statsCards.map(card => {
          const colors = colorMap[card.color];
          
          return (
            <div 
              key={card.id}
              className={`rounded-md sm:rounded-lg border ${colors.border} overflow-hidden transition-all duration-200 ${colors.hoverBg} hover:shadow-md`}
            >
              <div className="relative">
                {/* Colored gradient bar at top */}
                <div className={`h-0.5 xs:h-1 w-full bg-gradient-to-r ${colors.gradient}`}></div>
                
                <div className="p-1.5 xs:p-2 sm:p-3 lg:p-4">
                  <div className="flex justify-between items-start">
                    <div className="overflow-hidden">
                      <p className="text-2xs xs:text-xs sm:text-sm font-medium text-gray-500 mb-0.5 sm:mb-1">{card.title}</p>
                      <p className="text-sm xs:text-base sm:text-lg lg:text-xl font-bold text-gray-800 leading-tight truncate">
                        {formatValue(card.value, card.valueType)}
                      </p>
                      {card.subtitle && (
                        <p className="text-2xs xs:text-xs text-gray-500 mt-0.5 sm:mt-1 truncate">{card.subtitle}</p>
                      )}
                      {card.growth !== undefined && (
                        <div className="mt-0.5 sm:mt-1">
                          <GrowthIndicator value={card.growth} />
                        </div>
                      )}
                    </div>
                    <div className={`${colors.bg} p-1 xs:p-1.5 sm:p-2 rounded-full ${colors.text} flex-shrink-0`}>
                      {card.icon}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Add custom text-2xs size for extremely small text
const CustomTextStyles = () => (
  <style jsx global>{`
    .text-2xs {
      font-size: 0.825rem;
      line-height: 1rem;
    }
  `}</style>
);

const GlobalStatsWithStyles = (props) => (
  <>
    <CustomTextStyles />
    <GlobalStats {...props} />
  </>
);

export default GlobalStatsWithStyles;