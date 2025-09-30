import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Edit3, 
  FileText, 
  Trash2, 
  MapPin, 
  User, 
  Car, 
  Fuel,
  DollarSign,
  ChevronDown,
  ChevronRight,
  Package,
  Layers
} from 'lucide-react';
import TableHeader from './TableHeader';
import EmptyTableState from './EmptyTableState';

const TripTable = ({ isLoading, trips, sortConfig, onSort, onDelete, onShowDetails }) => {
  const [expandedGroups, setExpandedGroups] = useState(new Set());

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

  // Group trips by parent_trip_id
  const groupTrips = () => {
    const grouped = {};
    const standalone = [];
    
    trips.forEach(trip => {
      if (trip.parent_trip_id) {
        if (!grouped[trip.parent_trip_id]) {
          grouped[trip.parent_trip_id] = [];
        }
        grouped[trip.parent_trip_id].push(trip);
      } else {
        standalone.push(trip);
      }
    });
    
    return { grouped, standalone };
  };

  const toggleGroup = (parentId) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(parentId)) {
      newExpanded.delete(parentId);
    } else {
      newExpanded.add(parentId);
    }
    setExpandedGroups(newExpanded);
  };

  const { grouped, standalone } = groupTrips();

  // Combine parent groups with standalone trips for display
  const displayItems = [];
  
  // Add all standalone trips
  standalone.forEach(trip => {
    displayItems.push({ type: 'standalone', trip });
  });
  
  // Add parent groups
  Object.entries(grouped).forEach(([parentId, containers]) => {
    displayItems.push({ 
      type: 'parent', 
      parentId: parseInt(parentId), 
      containers,
      isExpanded: expandedGroups.has(parseInt(parentId))
    });
  });

  // Sort display items by date (using first container's date for groups)
  displayItems.sort((a, b) => {
    const dateA = a.type === 'standalone' ? a.trip.date : a.containers[0].date;
    const dateB = b.type === 'standalone' ? b.trip.date : b.containers[0].date;
    return new Date(dateB) - new Date(dateA);
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1200px]">
          <thead>
            <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <th className="py-4 pl-6 pr-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-12">
                {/* Expand column */}
              </th>
              <TableHeader
                label="Receipt No / Type"
                field="receipt_no"
                sortConfig={sortConfig}
                onSort={onSort}
                className="py-4 pl-3 pr-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
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
              />
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading && !trips.length ? (
              <tr>
                <td colSpan="9" className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-500 text-sm">Loading trips...</p>
                  </div>
                </td>
              </tr>
            ) : trips.length === 0 ? (
              <tr>
                <td colSpan="9" className="px-6 py-12">
                  <EmptyTableState />
                </td>
              </tr>
            ) : (
              displayItems.map((item, index) => {
                if (item.type === 'standalone') {
                  const trip = item.trip;
                  return (
                    <tr 
                      key={`standalone-${trip.ID}`}
                      className={`hover:bg-blue-50/50 transition-colors duration-150 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                      }`}
                    >
                      <td className="py-4 pl-6 pr-3">
                        {/* Empty expand cell */}
                      </td>
                      
                      {/* Receipt */}
                      <td className="py-4 pl-3 pr-3">
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
                            <div className="text-xs text-gray-500">Single Trip</div>
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
                  );
                } else {
                  // Parent group - now matching single trip styling
                  const containers = item.containers;
                  const firstContainer = containers[0];
                  const totalCapacity = containers.reduce((sum, c) => sum + c.tank_capacity, 0);
                  const isExpanded = item.isExpanded;
                  
                  return (
                    <React.Fragment key={`parent-${item.parentId}`}>
                      {/* Parent Row - Styled like single trips */}
                      <tr className={`hover:bg-blue-50/50 transition-colors duration-150 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                      }`}>
                        <td className="py-4 pl-6 pr-3">
                          <button
                            onClick={() => toggleGroup(item.parentId)}
                            className="p-1 hover:bg-blue-100 rounded transition-colors"
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-5 w-5 text-blue-600" />
                            ) : (
                              <ChevronRight className="h-5 w-5 text-blue-600" />
                            )}
                          </button>
                        </td>
                        
                        {/* Type indicator - matching single trip style */}
                        <td className="py-4 pl-3 pr-3">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                                <Layers className="h-5 w-5 text-purple-600" />
                              </div>
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-semibold text-gray-900">
                                Multi-Container
                              </div>
                              <div className="text-xs text-gray-500">
                                {containers.length} Containers
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Date */}
                        <td className="px-3 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {formatDate(firstContainer.date)}
                          </div>
                        </td>

                        {/* Company */}
                        <td className="px-3 py-4">
                          <div className="text-sm font-medium text-gray-900 truncate max-w-[120px]" title={firstContainer.company}>
                            {firstContainer.company}
                          </div>
                        </td>

                        {/* Route - Show terminal and destinations count */}
                        <td className="px-3 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center text-xs">
                              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                              <span className="text-gray-700 truncate" title={firstContainer.terminal}>
                                {firstContainer.terminal}
                              </span>
                            </div>
                            <div className="flex items-center text-xs">
                              <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                              <span className="text-gray-700">
                                {containers.length} destinations
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Vehicle & Driver */}
                        <td className="px-3 py-4">
                          <div className="space-y-2">
                            <div className="flex items-center">
                              <Car className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                              <div className="text-sm font-medium text-gray-900">{firstContainer.car_no_plate}</div>
                            </div>
                            <div className="flex items-center">
                              <div className="w-4 h-4 bg-gray-200 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                                <User className="h-2.5 w-2.5 text-gray-500" />
                              </div>
                              <div className="text-sm text-gray-700 truncate">
                                {firstContainer.driver_name}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Total Tank - styled like single trip */}
                        <td className="px-3 py-4">
                          <div className="flex items-center">
                            <Fuel className="h-4 w-4 text-gray-400 mr-2" />
                            <div className="text-sm font-medium text-gray-900">
                              {totalCapacity}L
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Total
                          </div>
                        </td>

                        {/* Summary - show click to expand */}
                        <td className="px-3 py-4">
                          <div className="text-xs text-purple-600 font-medium">
                            {isExpanded ? 'View less' : 'View containers'}
                          </div>
                        </td>

                        {/* Actions for parent */}
                        <td className="px-6 py-4 text-right">
  <div className="flex items-center justify-end space-x-2">
    <Link
      to={`/trips/multi-container/${item.parentId}/edit`}
      className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-blue-600 hover:text-blue-700 hover:bg-blue-100 transition-colors"
      title="Edit Multi-Container Trip"
    >
      <Edit3 className="h-4 w-4" />
    </Link>
    <button
      onClick={() => toggleGroup(item.parentId)}
      className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-purple-600 hover:text-purple-700 hover:bg-purple-100 transition-colors"
      title={isExpanded ? 'Collapse' : 'Expand'}
    >
      {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
    </button>
  </div>
</td>
                      </tr>

                      {/* Container Rows (when expanded) - indented with subtle styling */}
                      {isExpanded && containers.map((container, containerIndex) => (
                        <tr 
                          key={`container-${container.ID}`}
                          className="bg-purple-50/30 hover:bg-purple-50/50 transition-colors"
                        >
                          <td className="py-3 pl-6 pr-3">
                            <div className="w-px h-8 bg-purple-200 ml-2"></div>
                          </td>
                          
                          {/* Receipt with indent */}
                          <td className="py-3 pl-3 pr-3">
                            <div className="flex items-center pl-6">
                              <div className="flex-shrink-0">
                                <div className="w-8 h-8 rounded-lg bg-white border-2 border-purple-200 flex items-center justify-center">
                                  <span className="text-xs font-semibold text-purple-600">
                                    {containerIndex + 1}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">
                                  #{container.receipt_no}
                                </div>
                                <div className="text-xs text-gray-500">
                                  Container {containerIndex + 1}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-3 py-3">
                            {/* Empty - date is same for all */}
                          </td>

                          <td className="px-3 py-3">
                            {/* Empty - company is same for all */}
                          </td>

                          {/* Route - show drop-off point */}
                          <td className="px-3 py-3">
                            <div className="flex items-center text-xs pl-4">
                              <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                              <span className="text-gray-700">{container.drop_off_point}</span>
                            </div>
                          </td>

                          <td className="px-3 py-3">
                            {/* Empty - vehicle is same for all */}
                          </td>

                          {/* Container capacity */}
                          <td className="px-3 py-3">
                            <div className="flex items-center">
                              <Fuel className="h-4 w-4 text-gray-400 mr-2" />
                              <div className="text-sm font-medium text-gray-900">
                                {container.tank_capacity}L
                              </div>
                            </div>
                          </td>

                          {/* Distance & Fee */}
                          <td className="px-3 py-3">
                            <div className="space-y-1">
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                                <div className="text-sm font-semibold text-gray-900">
                                  {formatDistance(container.mileage)}
                                </div>
                              </div>
                              <div className="flex items-center">
                                <DollarSign className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                                <div className="text-sm font-semibold text-green-600">
                                  {formatCurrency(container.fee)}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Actions for container */}
                          <td className="px-6 py-3 text-right">
                            <div className="flex items-center justify-end space-x-2">
                            
                              <button
                                onClick={() => onShowDetails(container.ID)}
                                className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-green-600 hover:text-green-700 hover:bg-green-100 transition-colors"
                                title="View Details"
                              >
                                <FileText className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => onDelete(container.ID)}
                                className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-100 transition-colors"
                                title="Delete Container"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  );
                }
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TripTable;