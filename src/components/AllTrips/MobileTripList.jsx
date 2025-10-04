import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ChevronDown, 
  ChevronUp,
  ChevronRight,
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
  Layers,
  Package,
  CheckCircle2,
  Clock,
  Archive
} from 'lucide-react';
import EmptyTableState from './EmptyTableState';

const MobileTripList = ({ 
  isLoading, 
  trips, 
  visibleDetailId, 
  onToggleDetails, 
  onDelete, 
  onDeleteParent, 
  onShowDetails,
  onManageReceipt 
}) => {
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

  const truncateText = (text, maxLength = 20) => {
    if (!text) return '—';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Get receipt status for a trip
  // Replace the getReceiptStatus function with this version:
const getReceiptStatus = (trip) => {
  if (!trip.receipt_steps || trip.receipt_steps.length === 0) {
    return { 
      status: 'pending', 
      label: 'Pending', 
      classes: 'bg-gray-100 text-gray-700 border-gray-200',
      icon: Clock 
    };
  }
  
  const hasGarage = trip.receipt_steps.some(s => s.location === 'Garage');
  const hasOffice = trip.receipt_steps.some(s => s.location === 'Office');
  const isStamped = trip.receipt_steps.some(s => s.stamped === true);
  
  if (hasGarage && hasOffice) {
    return { 
      status: 'complete', 
      label: isStamped ? 'Complete & Stamped' : 'Complete', 
      classes: isStamped ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-green-100 text-green-700 border-green-200',
      icon: CheckCircle2 
    };
  }
  
  if (hasGarage || hasOffice) {
    return { 
      status: 'in_progress', 
      label: hasGarage ? 'In Garage' : 'In Office', 
      classes: 'bg-amber-100 text-amber-700 border-amber-200',
      icon: Archive 
    };
  }
  
  return { 
    status: 'pending', 
    label: 'Pending', 
    classes: 'bg-gray-100 text-gray-700 border-gray-200',
    icon: Clock 
  };
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
  
  standalone.forEach(trip => {
    displayItems.push({ type: 'standalone', trip });
  });
  
  Object.entries(grouped).forEach(([parentId, containers]) => {
    displayItems.push({ 
      type: 'parent', 
      parentId: parseInt(parentId), 
      containers,
      isExpanded: expandedGroups.has(parseInt(parentId))
    });
  });

  // Sort by date
  displayItems.sort((a, b) => {
    const dateA = a.type === 'standalone' ? a.trip.date : a.containers[0].date;
    const dateB = b.type === 'standalone' ? b.trip.date : b.containers[0].date;
    return new Date(dateB) - new Date(dateA);
  });

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
      {displayItems.map((item, index) => {
        if (item.type === 'standalone') {
          const trip = item.trip;
          const receiptStatus = getReceiptStatus(trip);
          const StatusIcon = receiptStatus.icon;

          return (
            <div 
              key={`standalone-${trip.ID}`}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
            >
              {/* Card Header */}
              <div 
                className="px-3 py-2.5 cursor-pointer"
                onClick={() => onToggleDetails(trip.ID)}
              >
                <div className="flex items-start justify-between mb-2.5">
                  <div className="flex-1 min-w-0 pr-3">
                    <div className="flex items-center mb-1.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center mr-2">
                        <FileText className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-gray-900">
                          #{trip.receipt_no || 'N/A'}
                        </h3>
                        <div className="text-xs text-gray-500">Single Trip</div>
                      </div>
                    </div>
                    
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

                {/* Receipt Status Badge */}
                <div className="mb-2.5">
  <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${receiptStatus.classes}`}>
    <StatusIcon className="h-3 w-3 mr-1.5" />
    {receiptStatus.label}
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

                    {/* Receipt Tracking Info */}
                    {trip.receipt_steps && trip.receipt_steps.length > 0 && (
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <div className="flex items-center mb-2">
                          <Archive className="h-3.5 w-3.5 text-blue-500 mr-1.5" />
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Receipt Tracking</span>
                        </div>
                        <div className="space-y-2">
                          {trip.receipt_steps.map((step, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs">
                              <div className="flex items-center">
                                <CheckCircle2 className={`h-3 w-3 mr-1.5 ${step.stamped ? 'text-emerald-500' : 'text-blue-500'}`} />
                                <span className="font-medium text-gray-700">{step.location}</span>
                              </div>
                              <div className="text-gray-500">
                                {step.received_by && (
                                  <span className="mr-2">{step.received_by}</span>
                                )}
                                {step.stamped && (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-semibold text-xs">
                                    Stamped
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

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
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        to={`/trips/${trip.ID}`}
                        className="inline-flex items-center justify-center px-3 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                      >
                        <Edit3 className="h-3.5 w-3.5 mr-1.5" />
                        Edit
                      </Link>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onShowDetails(trip.ID);
                        }}
                        className="inline-flex items-center justify-center px-3 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm"
                      >
                        <MapPin className="h-3.5 w-3.5 mr-1.5" />
                        Map
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onManageReceipt(trip.ID);
                        }}
                        className="inline-flex items-center justify-center px-3 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm"
                      >
                        <Archive className="h-3.5 w-3.5 mr-1.5" />
                        Receipt
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(trip.ID);
                        }}
                        className="inline-flex items-center justify-center px-3 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        } else {
          // Multi-container parent group
          const containers = item.containers;
          const firstContainer = containers[0];
          const totalCapacity = containers.reduce((sum, c) => sum + (c.tank_capacity || 0), 0);
          const isExpanded = item.isExpanded;
          const hasMultipleContainers = containers.length > 1;

          return (
            <div 
              key={`parent-${item.parentId}`}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
            >
              {/* Parent Card Header */}
              <div className="px-3 py-2.5">
                <div className="flex items-start justify-between mb-2.5">
                  <div className="flex-1 min-w-0 pr-3">
                    <div className="flex items-center mb-1.5">
                      <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center mr-2">
                        <Layers className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-gray-900">
                          Multi-Container
                        </h3>
                        <div className="text-xs text-gray-500">{containers.length} Containers</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-xs text-gray-600 mb-1">
                      <Calendar className="h-3 w-3 mr-1.5 text-gray-400 flex-shrink-0" />
                      <span className="font-medium">{formatDate(firstContainer.date)}</span>
                    </div>
                    
                    <div className="flex items-center text-xs text-gray-600">
                      <Building2 className="h-3 w-3 mr-1.5 text-gray-400 flex-shrink-0" />
                      <span 
                        className="font-medium" 
                        style={{ direction: 'ltr', textAlign: 'left' }}
                        title={firstContainer.company}
                      >
                        {truncateText(firstContainer.company, 28)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex-shrink-0 flex items-center space-x-2">
                    <Link
                      to={`/trips/multi-container/${item.parentId}/edit`}
                      className="w-6 h-6 rounded-md bg-blue-100 flex items-center justify-center hover:bg-blue-200 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Edit3 className="h-3.5 w-3.5 text-blue-600" />
                    </Link>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteParent(item.parentId);
                      }}
                      className="w-6 h-6 rounded-md bg-red-100 flex items-center justify-center hover:bg-red-200 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-red-600" />
                    </button>
                    <button
                      onClick={() => toggleGroup(item.parentId)}
                      className="w-6 h-6 rounded-md bg-purple-100 flex items-center justify-center hover:bg-purple-200 transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-3.5 w-3.5 text-purple-600" />
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5 text-purple-600" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Parent Summary */}
                <div className="bg-purple-50 rounded-lg px-3 py-2.5 border border-purple-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Terminal</div>
                      <div className="text-sm font-medium text-gray-900">{firstContainer.terminal}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Total Tank</div>
                      <div className="flex items-center justify-end">
                        <Fuel className="h-3.5 w-3.5 mr-1 text-purple-600" />
                        <span className="text-sm font-bold text-purple-600">{totalCapacity}L</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Vehicle & Driver Info */}
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center">
                    <Car className="h-3 w-3 text-gray-400 mr-1.5" />
                    <span className="font-medium text-gray-700">{firstContainer.car_no_plate}</span>
                  </div>
                  <div className="flex items-center">
                    <User className="h-3 w-3 text-gray-400 mr-1.5" />
                    <span className="font-medium text-gray-700">{truncateText(firstContainer.driver_name, 12)}</span>
                  </div>
                </div>
              </div>

              {/* Expanded Containers */}
              {isExpanded && (
                <div className="border-t border-purple-200 bg-purple-50/30">
                  <div className="p-3 space-y-3">
                    {containers.map((container, containerIndex) => {
                      const containerReceiptStatus = getReceiptStatus(container);
                      const ContainerStatusIcon = containerReceiptStatus.icon;

                      return (
                        <div 
                          key={container.ID}
                          className="bg-white rounded-lg border border-purple-200 overflow-hidden"
                        >
                          {/* Container Header */}
                          <div 
                            className="px-3 py-2 bg-purple-50 cursor-pointer"
                            onClick={() => onToggleDetails(container.ID)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center flex-1">
                                <div className="w-6 h-6 rounded-md bg-white border-2 border-purple-300 flex items-center justify-center mr-2">
                                  <span className="text-xs font-bold text-purple-600">{containerIndex + 1}</span>
                                </div>
                                <div>
                                  <div className="text-sm font-semibold text-gray-900">#{container.receipt_no}</div>
                                  <div className={`inline-flex items-center mt-0.5 px-1.5 py-0.5 rounded text-xs font-semibold ${containerReceiptStatus.classes}`}>
  <ContainerStatusIcon className="h-2.5 w-2.5 mr-1" />
  {containerReceiptStatus.label}
</div>
                                </div>
                              </div>
                              <div className="w-5 h-5 rounded bg-gray-100 flex items-center justify-center">
                                {visibleDetailId === container.ID ? (
                                  <ChevronUp className="h-3 w-3 text-gray-600" />
                                ) : (
                                  <ChevronDown className="h-3 w-3 text-gray-600" />
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Container Quick Info */}
                          <div className="px-3 py-2">
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center">
                                <div className="w-2 h-2 bg-red-500 rounded-full mr-1.5"></div>
                                <span className="text-gray-700 font-medium" title={container.drop_off_point}>
                                  {truncateText(container.drop_off_point, 18)}
                                </span>
                              </div>
<div className="flex items-center">
                                <Fuel className="h-3 w-3 text-gray-400 mr-1" />
                                <span className="font-semibold text-gray-900">{container.tank_capacity}L</span>
                              </div>
                            </div>
                          </div>

                          {/* Container Expanded Details */}
                          {visibleDetailId === container.ID && (
                            <div className="border-t border-gray-100 p-3 space-y-3 bg-gray-50">
                              {/* Receipt Tracking for Container */}
                              {container.receipt_steps && container.receipt_steps.length > 0 && (
                                <div className="bg-white rounded-lg p-2.5 border border-gray-200">
                                  <div className="flex items-center mb-2">
                                    <Archive className="h-3 w-3 text-blue-500 mr-1.5" />
                                    <span className="text-xs font-semibold text-gray-500 uppercase">Receipt</span>
                                  </div>
                                  <div className="space-y-1.5">
                                    {container.receipt_steps.map((step, idx) => (
                                      <div key={idx} className="flex items-center justify-between text-xs">
                                        <div className="flex items-center">
                                          <CheckCircle2 className={`h-2.5 w-2.5 mr-1.5 ${step.stamped ? 'text-emerald-500' : 'text-blue-500'}`} />
                                          <span className="font-medium text-gray-700">{step.location}</span>
                                        </div>
                                        {step.stamped && (
                                          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-semibold text-xs">
                                            Stamped
                                          </span>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Route Details */}
                              <div className="bg-white rounded-lg p-2.5 border border-gray-200">
                                <div className="flex items-center justify-between text-xs mb-2">
                                  <div className="flex items-center">
                                    <MapPin className="h-3 w-3 text-indigo-500 mr-1" />
                                    <span className="font-semibold text-gray-500 uppercase">Distance</span>
                                  </div>
                                  <span className="font-bold text-indigo-600">{formatDistance(container.mileage)}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                  <div className="flex items-center">
                                    <DollarSign className="h-3 w-3 text-emerald-500 mr-1" />
                                    <span className="font-semibold text-gray-500 uppercase">Fee</span>
                                  </div>
                                  <span className="font-bold text-emerald-600">{formatCurrency(container.fee)}</span>
                                </div>
                              </div>

                              {/* Action Buttons */}
                              <div className="grid grid-cols-2 gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onShowDetails(container.ID);
                                  }}
                                  className="inline-flex items-center justify-center px-2.5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-xs"
                                >
                                  <MapPin className="h-3 w-3 mr-1" />
                                  Map
                                </button>

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onManageReceipt(container.ID);
                                  }}
                                  className="inline-flex items-center justify-center px-2.5 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-xs"
                                >
                                  <Archive className="h-3 w-3 mr-1" />
                                  Receipt
                                </button>
                                
                                {hasMultipleContainers && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onDelete(container.ID);
                                    }}
                                    className="col-span-2 inline-flex items-center justify-center px-2.5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-xs"
                                  >
                                    <Trash2 className="h-3 w-3 mr-1" />
                                    Delete Container
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        }
      })}
    </div>
  );
};

export default MobileTripList;