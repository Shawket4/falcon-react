// File: components/trips/MobileTripList.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import EmptyTableState from './EmptyTableState';

const MobileTripList = ({ isLoading, trips, visibleDetailId, onToggleDetails, onDelete }) => {
  if (isLoading && !trips.length) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden p-4 text-center">
        <div className="flex justify-center">
          <svg className="animate-spin h-6 w-6 text-blue-500 mr-3" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Loading trips...</span>
        </div>
      </div>
    );
  }

  if (trips.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden p-6 text-center">
        <EmptyTableState />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {trips.map((trip) => (
        <div key={trip.ID} className="bg-white rounded-md shadow overflow-hidden">
          <div 
            className="px-3 py-3 border-b flex justify-between items-center cursor-pointer hover:bg-gray-50"
            onClick={() => onToggleDetails(trip.ID)}
          >
            <div className="w-4/5 overflow-hidden">
              <div className="font-medium text-gray-900 truncate">
                {trip.receipt_no ? `#${trip.receipt_no}` : 'No Receipt'} • {trip.date}
              </div>
              <div className="text-sm text-gray-500 truncate">
                {trip.company} • {trip.terminal} → {trip.drop_off_point}
              </div>
            </div>
            <div className="flex items-center">
              <span className="px-2 mr-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 whitespace-nowrap">
                {typeof trip.fee === 'number' ? 
                  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(trip.fee) : 
                  trip.fee}
              </span>
              <svg className="h-5 w-5 text-gray-400 transform transition-transform duration-200" 
                style={{ transform: visibleDetailId === trip.ID ? 'rotate(180deg)' : 'rotate(0)' }}
                fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          
          {visibleDetailId === trip.ID && (
            <div className="px-3 py-3 bg-gray-50 space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs font-medium text-gray-500">Company</div>
                  <div className="font-medium">{trip.company}</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-500">Terminal</div>
                  <div>{trip.terminal}</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-500">Drop-off Point</div>
                  <div>{trip.drop_off_point}</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-500">Tank Capacity</div>
                  <div>{trip.tank_capacity || '—'}</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-500">Driver</div>
                  <div>{trip.driver_name}</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-500">Car</div>
                  <div>{trip.car_no_plate}</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-500">Distance</div>
                  <div className="font-medium">
                    {typeof trip.mileage === 'number' ? `${trip.mileage.toFixed(2)} km` : trip.mileage || '—'}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-500">Fee</div>
                  <div className="font-medium">
                    {typeof trip.fee === 'number' ? 
                      new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(trip.fee) : 
                      trip.fee || '—'}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between pt-2 border-t border-gray-200 space-x-2">
                <Link
                  to={`/trips/${trip.ID}`}
                  className="flex-1 inline-flex items-center justify-center px-3 py-1.5 border border-transparent rounded-md text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </Link>
                <button
                  onClick={() => onDelete(trip.ID)}
                  className="flex-1 inline-flex items-center justify-center px-3 py-1.5 border border-transparent rounded-md text-xs font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default MobileTripList;