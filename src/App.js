import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { VehicleStatusManagement } from './components/Slack';

// Original imports
import TruckList from './components/TruckList';
import TruckDetail from './components/TruckDetail';
import TireList from './components/TireList';
import CreateTruck from './components/CreateTruck';
import CreateTire from './components/CreateTire';
import Login from './components/Login';
import Layout from './components/Layout';
import { AllDrivers, DriverDetails, DriverLoans, AddDriverLoan, AddDriver } from './components/Drivers';
import { FuelEventsList, FuelEventDetails, AddFuelEvent, EditFuelEvent } from './components/FuelEvents';
import { AuthProvider } from './components/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import WhatsAppWrapper from './components/Whatsapp/WhatsappWrapper'; // New import
import { CarServiceManagement } from './components/ServiceInvoices';
// Original imports for distance and fee mapping components
import DistanceMappings from './components/DistanceMappings';
import FeeMappings from './components/FeeMappings';
import AddTripComponent from './components/TripForm';
import TripDetails from './components/TripDetails';
import { AllOilChanges, AddOilChange, EditOilChange } from './components/OilChanges';

// Import the refactored TripList component instead of AllTrips
import { TripList, DriverAnalytics, TripReportGarage } from './components/AllTrips';



// Import vendor financial system components
import {
  Dashboard,
  VendorManagement,
  VendorDetail,
  VendorForm,
  TransactionForm
} from './components/Vendors';
import LandingPage from './landing_page/landing_page';
import DriverExpenses from './components/Drivers/DriverExpenses';
import AddDriverExpense from './components/Drivers/AddDriverExpense';
import DriverSalaries from './components/Drivers/DriverSalaries';
import AddDriverSalary from './components/Drivers/AddDriverSalary';
import AddCar from './components/AddCar';
import CarManagement from './components/CarManagement';
import UserManagement from './components/UserManagement';
import OpenStreetMapApp from './components/OpenStreetMap';
import Portfolio from './portfolio';
import CV from './cv';
import SpeedViolations from './components/SpeedViolations';
import LogsViewer from './components/LogsViewer';
import EditDriver from './components/Drivers/EditDriver';

// Map paths to readable names for breadcrumbs
export const pathNames = {
  trucks: 'Trucks',
  'trucks/create': 'Add Truck',
  tires: 'Tires',
  'tires/create': 'Add Tire',
  drivers: 'Drivers',
  'add-fuel': 'Add Fuel Event',
  distances: 'Distance Mappings',
  fees: 'Fee Mappings',
  'trips-list': 'Trips',
  'add-trip': 'Add Trip',
  'oil-changes-list': 'Oil Changes',
  'add-oil-change': 'Add Oil Change',
  vendors: 'Vendors',
  'vendors/create': 'Add Vendor',
  'finance-dashboard': 'Finance Dashboard',
  transactions: 'Transactions',
  'driver-analytics': 'Driver Analytics',
  'car-management': 'Car Management',
  'map': 'OpenStreetMap',
  'trip-report-garage': 'Trip Report - Garage',
};

// Permission level required for certain operations
const REQUIRED_PERMISSION_LEVEL = 3;

function App() {
  return (
    <AuthProvider>
      <WhatsAppWrapper>
        <Router>
          <Routes>
            {/* Public route - Login */}
            <Route path='/portfolio' element={<Portfolio/>}/>
            <Route path='/cv' element={<CV/>}/>
            <Route path='/landing-page' element={<LandingPage/>}/>
            <Route path="/login" element={<Login />} />

            {/* Protected routes - require authentication */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout>
                  <FuelEventsList />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/service-management" element={
  <ProtectedRoute>
    <Layout>
      <CarServiceManagement />
    </Layout>
  </ProtectedRoute>
} />
<Route path="/vehicle-status" element={
  <ProtectedRoute>
    <Layout>
      <VehicleStatusManagement />
    </Layout>
  </ProtectedRoute>
} />
<Route path="/trip-report-garage" element={
  <ProtectedRoute>
    <Layout>
      <TripReportGarage />
    </Layout>
  </ProtectedRoute>
} />
            {/* Add Fuel Event - Requires permission level 3 or higher */}
            <Route path="/add-fuel" element={
              <ProtectedRoute minPermissionLevel={REQUIRED_PERMISSION_LEVEL}>
                <Layout>
                  <AddFuelEvent />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/details/:id" element={
              <ProtectedRoute>
                <Layout>
                  <FuelEventDetails />
                </Layout>
              </ProtectedRoute>
            } />
            
            {/* Edit Fuel Event - Requires permission level 3 or higher */}
            <Route path="/edit-fuel/:id" element={
              <ProtectedRoute minPermissionLevel={REQUIRED_PERMISSION_LEVEL}>
                <Layout>
                  <EditFuelEvent />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/drivers" element={
              <ProtectedRoute>
                <Layout>
                  <AllDrivers />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/driver/:id" element={
              <ProtectedRoute>
                <Layout>
                  <DriverDetails />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/driver/edit/:id" element={
              <ProtectedRoute>
                <Layout>
                  <EditDriver />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/driver/loans/:id" element={
              <ProtectedRoute>
                <Layout>
                  <DriverLoans />
                </Layout>
              </ProtectedRoute>
            } />

          <Route path="/driver/expenses/:id" element={
              <ProtectedRoute>
                <Layout>
                  <DriverExpenses />
                </Layout>
              </ProtectedRoute>
            } />

          <Route path="/driver/salaries/:id" element={
              <ProtectedRoute>
                <Layout>
                  <DriverSalaries />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/driver/salaries/:id/add" element={
              <ProtectedRoute>
                <Layout>
                  <AddDriverSalary />
                </Layout>
              </ProtectedRoute>
            } />

          <Route path="/add-driver" element={
              <ProtectedRoute>
                <Layout>
                  <AddDriver />
                </Layout>
              </ProtectedRoute>
            } />

          <Route path="/add-car" element={
              <ProtectedRoute>
                <Layout>
                  <AddCar />
                </Layout>
              </ProtectedRoute>
            } />

          <Route path="/car-management" element={
              <ProtectedRoute>
                <Layout>
                  <CarManagement />
                </Layout>
              </ProtectedRoute>
            } />
            
            {/* Add Driver Loan - Requires permission level 3 or higher */}
            <Route path="/driver/loans/:id/add" element={
              <ProtectedRoute minPermissionLevel={REQUIRED_PERMISSION_LEVEL}>
                <Layout>
                  <AddDriverLoan />
                </Layout>
              </ProtectedRoute>
            } />
             {/* Add Driver Expense - Requires permission level 3 or higher */}
             <Route path="/driver/expenses/:id/add" element={
              <ProtectedRoute minPermissionLevel={REQUIRED_PERMISSION_LEVEL}>
                <Layout>
                  <AddDriverExpense />
                </Layout>
              </ProtectedRoute>
            } />
            
            {/* Truck routes */}
            <Route path="/trucks" element={
              <ProtectedRoute>
                <Layout>
                  <TruckList />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/trucks/:id" element={
              <ProtectedRoute>
                <Layout>
                  <TruckDetail />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/trucks/create" element={
              <ProtectedRoute>
                <Layout>
                  <CreateTruck />
                </Layout>
              </ProtectedRoute>
            } />
            
            {/* Tire routes */}
            <Route path="/tires" element={
              <ProtectedRoute>
                <Layout>
                  <TireList />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/tires/create" element={
              <ProtectedRoute>
                <Layout>
                  <CreateTire />
                </Layout>
              </ProtectedRoute>
            } />
            
            {/* Distance mapping routes */}
            <Route path="/distances" element={
              <ProtectedRoute>
                <Layout>
                  <DistanceMappings />
                </Layout>
              </ProtectedRoute>
            } />
            
            {/* Fee mapping routes - Requires permission level 3 or higher */}
            <Route path="/fees" element={
              <ProtectedRoute minPermissionLevel={REQUIRED_PERMISSION_LEVEL}>
                <Layout>
                  <FeeMappings />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/add-trip" element={
              <ProtectedRoute>
                <Layout>
                  <AddTripComponent />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/trips/:id" element={
              <ProtectedRoute>
                <Layout>
                  <AddTripComponent />
                </Layout>
              </ProtectedRoute>
            } />

            {/* Updated: Using the refactored TripList component */}
            <Route path="/trips-list" element={
              <ProtectedRoute>
                <Layout>
                  <TripList />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/oil-changes-list" element={
              <ProtectedRoute>
                <Layout>
                  <AllOilChanges />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/add-oil-change" element={
              <ProtectedRoute>
                <Layout>
                  <AddOilChange />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/edit-oil-change/:oilChangeId" element={
              <ProtectedRoute>
                <Layout>
                  <EditOilChange />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/trip-details/:tripId" element={
              <ProtectedRoute>
                <Layout>
                  <TripDetails />
                </Layout>
              </ProtectedRoute>
            } />
            
            {/* Admin-only route example */}
            <Route path="/admin" element={
              <ProtectedRoute requiredPermission="admin">
                <Layout>
                  <div className="p-6 bg-white rounded-lg shadow">
                    <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
                    <p>This page is only visible to users with admin permissions.</p>
                  </div>
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/driver-analytics" element={
              <ProtectedRoute minPermissionLevel={REQUIRED_PERMISSION_LEVEL}>
                <Layout>
                  <DriverAnalytics />
                </Layout>
              </ProtectedRoute>
            } />

            {/* Vendor Financial System Routes */}
            <Route path="/finance-dashboard" element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/vendors" element={
              <ProtectedRoute>
                <Layout>
                  <VendorManagement />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/vendors/create" element={
              <ProtectedRoute minPermissionLevel={REQUIRED_PERMISSION_LEVEL}>
                <Layout>
                  <div className="p-6 bg-white rounded-lg shadow">
                    <h1 className="text-2xl font-bold mb-6">Add New Vendor</h1>
                    <VendorForm 
                      onSubmit={(data) => console.log('Submit new vendor:', data)}
                      onCancel={() => window.history.back()}
                    />
                  </div>
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/vendors/:id" element={
              <ProtectedRoute>
                <Layout>
                  <VendorDetail />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/vendors/:id/add-transaction" element={
              <ProtectedRoute>
                <Layout>
                  <div className="p-6 bg-white rounded-lg shadow">
                    <h1 className="text-2xl font-bold mb-6">Add Transaction</h1>
                    <TransactionForm 
                      onSubmit={(data) => console.log('Submit transaction:', data)}
                      onCancel={() => window.history.back()}
                    />
                  </div>
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/transactions" element={
              <ProtectedRoute>
                <Layout>
                  <div className="p-6 bg-white rounded-lg shadow">
                    <h1 className="text-2xl font-bold mb-4">All Transactions</h1>
                    <p>This page is under construction. Please use the vendor details view to manage transactions.</p>
                  </div>
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/user-management" element={
              <ProtectedRoute minPermissionLevel={REQUIRED_PERMISSION_LEVEL}>
                <Layout>
                  <UserManagement />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/map" element={
              <ProtectedRoute>
                <Layout>
                  <OpenStreetMapApp />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/speed-violations" element={
              <ProtectedRoute>
                <Layout>
                  <SpeedViolations />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/logs" element={
              <ProtectedRoute minPermissionLevel={4}>
                <Layout>
                  <LogsViewer />
                </Layout>
              </ProtectedRoute>
            } />

            {/* Catch-all redirect to login */}
            <Route path="*" element={<Navigate to="/landing-page" replace />} />
          </Routes>
        </Router>
      </WhatsAppWrapper>
    </AuthProvider>
  );
}

export default App;