# Falcon React - Fleet Management System

A comprehensive React-based fleet management system for Apex Transport.

## Features

### Car Management

- **Car Management Component**: A new component that allows you to view all cars and manage driver assignments
- **Features**:
  - View all cars in a grid layout with detailed information
  - Search cars by plate number, type, or transporter
  - Filter cars by assignment status (All, Assigned, Unassigned)
  - Edit driver assignments for each car
  - View license expiration dates with color-coded status indicators
  - Real-time updates when driver assignments are changed

### How to Use Car Management

1. **Access the Component**: Navigate to `/car-management` in your application
2. **View Cars**: All cars are displayed in a responsive grid layout
3. **Search**: Use the search bar to find specific cars by plate number, type, or transporter
4. **Filter**: Use the dropdown to filter cars by assignment status
5. **Edit Driver Assignment**:
   - Click the edit icon (pencil) next to any car's driver section
   - Select a new driver from the dropdown
   - Click "Save" to update the assignment
   - The change is immediately reflected in the UI

### API Endpoints Used

The CarManagement component uses the following API endpoints:

- `GET /api/GetCars` - Fetches all cars with their details
- `GET /api/GetDrivers` - Fetches all available drivers
- `PATCH /api/protected/SetCarDriverPair` - Updates car-driver assignments

### Car Data Structure

Each car object contains:

- `ID`: Unique car identifier
- `car_no_plate`: License plate number
- `car_type`: Type of car (e.g., "No Trailer", "Trailer")
- `transporter`: Transport company name
- `tank_capacity`: Tank capacity in liters
- `driver_id`: ID of assigned driver (null if unassigned)
- `license_expiration_date`: Car license expiration date
- `calibration_expiration_date`: Calibration license expiration date
- `tank_license_expiration_date`: Tank license expiration date (for trailers)
- `is_approved`: Approval status
- `is_in_trip`: Whether car is currently in a trip
- `location`: Current location of the car

### Driver Data Structure

Each driver object contains:

- `ID`: Unique driver identifier
- `name`: Driver's full name
- `mobile_number`: Contact number
- `transporter`: Associated transport company

## Installation and Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Configure your API endpoints in `src/config.js`
4. Start the development server: `npm start`

## Available Scripts

- `npm start` - Start development server
- `npm test` - Run tests
- `npm run build` - Build for production

## Dependencies

- React 18+
- React Router DOM
- Axios for API calls
- Lucide React for icons
- Tailwind CSS for styling

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.
