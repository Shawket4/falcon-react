// File: components/trips/TripTable.jsx
import { Link } from 'react-router-dom';
import { 
  Edit3, 
  FileText, 
  Trash2, 
  Calendar, 
  Building2, 
  MapPin, 
  User, 
  Car, 
  Fuel,
  DollarSign,
  Route
} from 'lucide-react';
import TableHeader from './TableHeader';
import EmptyTableState from './EmptyTableState';

const TripTable = ({ isLoading, trips, sortConfig, onSort, onDelete, onShowDetails }) => {
  const formatCurrency = (amount) => {
    if (typeof amount !== 'number') return amount || '—';
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
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

  const getStatusBadge = (status) => {
    // You can expand this based on trip status if available
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Completed
      </span>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1200px]">
          <thead>
            <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <TableHeader
                label="Receipt No"
                field="receipt_no"
                sortConfig={sortConfig}
                onSort={onSort}
                className="py-4 pl-6 pr-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
              />
              <TableHeader
                label="Date"
                field="date"
                sortConfig={sortConfig}
                onSort={onSort}
                className="px-3 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
              />
              <TableHeader
                label="Company"
                field="company"
                sortConfig={sortConfig}
                onSort={onSort}
                className="px-3 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
              />
              <TableHeader
                label="Route"
                field="terminal"
                sortConfig={sortConfig}
                onSort={onSort}
                className="px-3 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
              />
              <TableHeader
                label="Vehicle & Driver"
                field="car_no_plate"
                sortConfig={sortConfig}
                onSort={onSort}
                className="px-3 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
              />
              <TableHeader
                label="Tank"
                field="tank_capacity"
                sortConfig={sortConfig}
                onSort={onSort}
                className="px-3 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
              />
              <TableHeader
                label="Distance & Fee"
                field="mileage"
                sortConfig={sortConfig}
                onSort={onSort}
                className="px-3 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                icon={
                  <svg className="h-4 w-4 text-gray-400 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                }
              />
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
                      <tbody className="divide-y divide-gray-100">
            {isLoading && !trips.length ? (
              <tr>
                <td colSpan="8" className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-500 text-sm">Loading trips...</p>
                  </div>
                </td>
              </tr>
            ) : trips.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-6 py-12">
                  <EmptyTableState />
                </td>
              </tr>
            ) : (
              trips.map((trip, index) => (
                <tr 
                  key={trip.ID} 
                  className={`hover:bg-blue-50/50 transition-colors duration-150 ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                  }`}
                >
                  {/* Receipt */}
                  <td className="py-4 pl-6 pr-3">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-semibold text-gray-900">
                          #{trip.receipt_no || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Date */}
                  <td className="px-3 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {formatDate(trip.date)}
                    </div>
                  </td>

                  {/* Company */}
                  <td className="px-3 py-4">
                    <div className="text-sm font-medium text-gray-900 truncate max-w-[120px]" title={trip.company}>
                      {trip.company}
                    </div>
                  </td>

                  {/* Route */}
                  <td className="px-3 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center text-xs">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        <span className="text-gray-700 truncate" style={{ direction: 'ltr', textAlign: 'left' }} title={trip.terminal}>
                          {trip.terminal}
                        </span>
                      </div>
                      <div className="flex items-center text-xs">
                        <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                        <span className="text-gray-700 truncate" style={{ direction: 'ltr', textAlign: 'left' }} title={trip.drop_off_point}>
                          {trip.drop_off_point}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Vehicle & Driver */}
                  <td className="px-3 py-4">
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Car className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                        <div className="text-sm font-medium text-gray-900">{trip.car_no_plate}</div>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-gray-200 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                          <User className="h-2.5 w-2.5 text-gray-500" />
                        </div>
                        <div 
                          className="text-sm text-gray-700 truncate" 
                          style={{ direction: 'ltr', textAlign: 'left' }}
                          title={trip.driver_name}
                        >
                          {trip.driver_name}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Tank */}
                  <td className="px-3 py-4">
                    <div className="flex items-center">
                      <Fuel className="h-4 w-4 text-gray-400 mr-2" />
                      <div className="text-sm font-medium text-gray-900">
                        {trip.tank_capacity || '—'}L
                      </div>
                    </div>
                  </td>

                  {/* Distance & Fee */}
                  <td className="px-3 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                        <div className="text-sm font-semibold text-gray-900">
                          {formatDistance(trip.mileage)}
                        </div>
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        <div className="text-sm font-semibold text-green-600">
                          {formatCurrency(trip.fee)}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Link
                        to={`/trips/${trip.ID}`}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-blue-600 hover:text-blue-700 hover:bg-blue-100 transition-colors"
                        title="Edit Trip"
                      >
                        <Edit3 className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => onShowDetails(trip.ID)}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-green-600 hover:text-green-700 hover:bg-green-100 transition-colors"
                        title="View Details"
                      >
                        <FileText className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDelete(trip.ID)}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-100 transition-colors"
                        title="Delete Trip"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TripTable;