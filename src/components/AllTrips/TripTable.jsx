// File: components/trips/TripTable.jsx
import { Link } from 'react-router-dom';
import TableHeader from './TableHeader';
import EmptyTableState from './EmptyTableState';

const TripTable = ({ isLoading, trips, sortConfig, onSort, onDelete }) => {
  return (
    <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm w-full">
      <table className="w-full min-w-[800px] divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <TableHeader
              label="Receipt No"
              field="receipt_no"
              sortConfig={sortConfig}
              onSort={onSort}
              className="py-3 pl-4 pr-3 w-24"
            />
            <TableHeader
              label="Date"
              field="date"
              sortConfig={sortConfig}
              onSort={onSort}
              className="px-3 py-3 w-24"
            />
            <TableHeader
              label="Company"
              field="company"
              sortConfig={sortConfig}
              onSort={onSort}
              className="px-3 py-3 w-32"
            />
            <TableHeader
              label="Terminal"
              field="terminal"
              sortConfig={sortConfig}
              onSort={onSort}
              className="px-3 py-3 w-32"
            />
            <TableHeader
              label="Drop-off"
              field="drop_off_point"
              sortConfig={sortConfig}
              onSort={onSort}
              className="px-3 py-3 w-32"
            />
            <TableHeader
              label="Tank"
              field="tank_capacity"
              sortConfig={sortConfig}
              onSort={onSort}
              className="px-3 py-3 w-24"
            />
            <TableHeader
              label="Driver"
              field="driver_name"
              sortConfig={sortConfig}
              onSort={onSort}
              className="px-3 py-3 w-32"
            />
            <TableHeader
              label="Car"
              field="car_no_plate"
              sortConfig={sortConfig}
              onSort={onSort}
              className="px-3 py-3 w-24"
            />
            <TableHeader
              label="Distance"
              field="mileage"
              sortConfig={sortConfig}
              onSort={onSort}
              className="px-3 py-3 w-24"
              icon={
                <svg className="h-4 w-4 text-gray-400 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              }
            />
            <TableHeader
              label="Fee"
              field="fee"
              sortConfig={sortConfig}
              onSort={onSort}
              className="px-3 py-3 w-24"
              icon={
                <svg className="h-4 w-4 text-gray-400 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            <th scope="col" className="relative px-3 py-3 text-right w-28">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {isLoading && !trips.length ? (
            <tr>
              <td colSpan="11" className="px-4 py-8 text-center text-sm text-gray-500">
                <div className="flex justify-center">
                  <svg className="animate-spin h-6 w-6 text-blue-500 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Loading trips...</span>
                </div>
              </td>
            </tr>
          ) : trips.length === 0 ? (
            <tr>
              <td colSpan="11">
                <EmptyTableState />
              </td>
            </tr>
          ) : (
            trips.map((trip) => (
              <tr key={trip.ID} className="hover:bg-gray-50">
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 truncate">
                  {trip.receipt_no || '—'}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 truncate">
                  {trip.date}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 truncate">
                  {trip.company}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 truncate">
                  {trip.terminal}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 truncate">
                  {trip.drop_off_point}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 truncate">
                  {trip.tank_capacity || '—'}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 truncate">
                  {trip.driver_name}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 truncate">
                  {trip.car_no_plate}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
                  {typeof trip.mileage === 'number' ? 
                    `${trip.mileage.toFixed(2)} km` : 
                    trip.mileage}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
                  {typeof trip.fee === 'number' ? 
                    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(trip.fee) : 
                    trip.fee}
                </td>
                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <Link
                      to={`/trips/${trip.ID}`}
                      className="text-blue-600 hover:text-blue-900 flex items-center"
                    >
                      <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </Link>
                    <button
                      onClick={() => onDelete(trip.ID)}
                      className="text-red-600 hover:text-red-900 flex items-center"
                    >
                      <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TripTable;