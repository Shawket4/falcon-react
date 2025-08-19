// File: components/trips/MobileTripList.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ChevronDown, 
  ChevronUp, 
  Edit3, 
  FileText, 
  Trash2,
  Calendar,
  Building2,
  MapPin,
  User,
  Car,
  Fuel,
  DollarSign
} from 'lucide-react';
import EmptyTableState from './EmptyTableState';

const MobileTripList = ({ isLoading, trips, visibleDetailId, onToggleDetails, onDelete, onShowDetails }) => {
  const formatCurrency = (amount) => {
    if (typeof amount !== 'number') return amount || '—';
    return new Intl.NumberFormat('en-US', { 
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDistance = (distance) => {
    if (typeof distance !== 'number') return distance || '—';
    return `${distance.toFixed(1)} km`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const truncateText = (text, maxLength = 20) => {
    if (!text) return '—';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (isLoading && !trips.length) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
        <div className="flex flex-col items-center justify-center">
          <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-3"></div>
          <p className="text-gray-500 text-sm">Loading trips...</p>
        </div>
      </div>
    );
  }

  if (trips.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <EmptyTableState />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {trips.map((trip) => (
        <div 
          key={trip.ID} 
          className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
        >
          {/* Card Header */}
          <div 
            className="px-3 py-2.5 cursor-pointer"
            onClick={() => onToggleDetails(trip.ID)}
          >
            <div className="flex items-start justify-between mb-2.5">
              <div className="flex-1 min-w-0 pr-3">
                <h3 className="text-base font-bold text-gray-900 mb-1.5">
                  #{trip.receipt_no || 'N/A'}
                </h3>
                
                <div className="flex items-center text-xs text-gray-600 mb-1">
                  <Calendar className="h-3 w-3 mr-1.5 text-gray-400 flex-shrink-0" />
                  <span className="font-medium">{formatDate(trip.date)}</span>
                </div>
                
                <div className="flex items-center text-xs text-gray-600">
                  <Building2 className="h-3 w-3 mr-1.5 text-gray-400 flex-shrink-0" />
                  <span 
                    className="font-medium" 
                    style={{ direction: 'ltr', textAlign: 'left' }}
                    title={trip.company}
                  >
                    {truncateText(trip.company, 28)}
                  </span>
                </div>
              </div>
              
              {/* Expand Button */}
              <div className="flex-shrink-0">
                <div className="w-6 h-6 rounded-md bg-gray-100 flex items-center justify-center">
                  {visibleDetailId === trip.ID ? (
                    <ChevronUp className="h-3.5 w-3.5 text-gray-600" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5 text-gray-600" />
                  )}
                </div>
              </div>
            </div>

            {/* Two Column Route Preview */}
            <div className="bg-gray-50 rounded-lg px-3 py-2.5 border border-gray-100">
              <div className="flex items-start justify-between">
                {/* Left Column - Route */}
                <div className="flex-1 pr-3">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Route</div>
                  <div className="space-y-1.5">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2 flex-shrink-0"></div>
                      <span 
                        className="text-xs font-medium text-gray-800 leading-tight" 
                        style={{ direction: 'ltr', textAlign: 'left' }}
                        title={trip.terminal}
                      >
                        {truncateText(trip.terminal, 24)}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-red-500 rounded-full mr-2 flex-shrink-0"></div>
                      <span 
                        className="text-xs font-medium text-gray-800 leading-tight" 
                        style={{ direction: 'ltr', textAlign: 'left' }}
                        title={trip.drop_off_point}
                      >
                        {truncateText(trip.drop_off_point, 24)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Column - Distance & Fee */}
                <div className="text-right">
                  <div className="mb-2.5">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Distance</div>
                    <div className="flex items-center justify-end">
                      <MapPin className="h-3.5 w-3.5 mr-1 text-indigo-500 flex-shrink-0" />
                      <span className="text-sm font-bold text-indigo-600">{formatDistance(trip.mileage)}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Fee</div>
                    <div className="flex items-center justify-end">
                      <DollarSign className="h-3.5 w-3.5 mr-1 text-emerald-500 flex-shrink-0" />
                      <span className="text-sm font-bold text-emerald-600">{formatCurrency(trip.fee)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Expanded Details */}
          {visibleDetailId === trip.ID && (
            <div className="border-t border-gray-100 bg-gray-50/30">
              <div className="p-4 space-y-4">
                {/* Vehicle & Driver Grid */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Vehicle Info */}
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <div className="flex items-center mb-2">
                      <Car className="h-3.5 w-3.5 text-slate-500 mr-1.5" />
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Vehicle</span>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm font-bold text-gray-900">{trip.car_no_plate}</div>
                      <div className="flex items-center text-xs text-gray-600">
                        <Fuel className="h-3 w-3 mr-1 text-orange-500 flex-shrink-0" />
                        <span className="font-medium">{trip.tank_capacity || '—'}L</span>
                      </div>
                    </div>
                  </div>

                  {/* Driver Info */}
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <div className="flex items-center mb-2">
                      <User className="h-3.5 w-3.5 text-slate-500 mr-1.5" />
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Driver</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-5 h-5 bg-slate-200 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                        <User className="h-2.5 w-2.5 text-slate-600" />
                      </div>
                      <div 
                        className="text-sm font-bold text-gray-900 leading-tight" 
                        style={{ direction: 'ltr', textAlign: 'left' }}
                        title={trip.driver_name}
                      >
                        {truncateText(trip.driver_name, 15)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Route Details */}
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center mb-3">
                    <MapPin className="h-3.5 w-3.5 text-indigo-500 mr-1.5" />
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Full Route</span>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="flex flex-col items-center mt-0.5">
                      <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></div>
                      <div className="w-0.5 h-6 bg-gray-300 my-1.5"></div>
                      <div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div>
                    </div>
                    <div className="flex-1 space-y-3 min-w-0">
                      <div>
                        <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-0.5">Pickup</div>
                        <div 
                          className="text-sm font-medium text-gray-900 leading-tight" 
                          style={{ direction: 'ltr', textAlign: 'left' }}
                          title={trip.terminal}
                        >
                          {trip.terminal}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-0.5">Drop-off</div>
                        <div 
                          className="text-sm font-medium text-gray-900 leading-tight" 
                          style={{ direction: 'ltr', textAlign: 'left' }}
                          title={trip.drop_off_point}
                        >
                          {trip.drop_off_point}
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-0.5">Distance</div>
                      <div className="text-sm font-bold text-indigo-600">{formatDistance(trip.mileage)}</div>
                    </div>
                  </div>
                </div>

                {/* Fee Summary */}
                <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg p-3 border border-emerald-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 text-emerald-600 mr-1.5" />
                      <span className="text-sm font-semibold text-emerald-800 uppercase tracking-wide">Total Fee</span>
                    </div>
                    <div className="text-lg font-bold text-emerald-700">
                      {formatCurrency(trip.fee)}
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex space-x-2.5 pt-1">
                  <Link
                    to={`/trips/${trip.ID}`}
                    className="flex-1 inline-flex items-center justify-center px-3 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                  >
                    <Edit3 className="h-3.5 w-3.5 mr-1.5" />
                    Edit
                  </Link>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onShowDetails(trip.ID);
                    }}
                    className="flex-1 inline-flex items-center justify-center px-3 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm"
                  >
                    <FileText className="h-3.5 w-3.5 mr-1.5" />
                    Details
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(trip.ID);
                    }}
                    className="inline-flex items-center justify-center px-3 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default MobileTripList;