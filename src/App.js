import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Original imports
import AddFuelEvent from './components/AddFuelEvent';
import FuelEventDetails from './components/FuelEventDetails';
import EditFuelEvent from './components/EditFuelEvent';
import AllDrivers from './components/AllDrivers';
import DriverDetails from './components/DriverDetails';
import DriverLoans from './components/DriverLoans';
import AddDriverLoan from './components/AddDriverLoan';
import TruckList from './components/TruckList';
import TruckDetail from './components/TruckDetail';
import TireList from './components/TireList';
import CreateTruck from './components/CreateTruck';
import CreateTire from './components/CreateTire';
import Login from './components/Login';
import Layout from './components/Layout';
import {FuelEventsList} from './components/FuelEvents';
import { AuthProvider } from './components/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Original imports for distance and fee mapping components
import DistanceMappings from './components/DistanceMappings';
import FeeMappings from './components/FeeMappings';
import AddTripComponent from './components/TripForm';
import TripDetails from './components/TripDetails';
import OilChangeList from './components/AllOilChanges';
import EditOilChange from './components/EditOilChange';
import AddOilChange from './components/AddOilChange';

// Import the refactored TripList component instead of AllTrips
import { TripList } from './components/AllTrips';

// New Vendor Expense components
import VendorList from './components/VendorList';
import VendorForm from './components/VendorForm';
import ExpenseList from './components/ExpenseList';
import ExpenseForm from './components/ExpenseForm';
import Dashboard from './components/VendorDashboard'; // This is the vendor expense dashboard

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
  
  // Add vendor expense path names
  vendors: 'Vendors',
  'add-vendor': 'Add Vendor',
  'edit-vendor': 'Edit Vendor',
  expenses: 'Expenses',
  'add-expense': 'Add Expense',
  'edit-expense': 'Edit Expense',
  'vendor-expenses': 'Vendor Expenses',
};

// Permission level required for certain operations
const REQUIRED_PERMISSION_LEVEL = 3;

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public route - Login */}
          <Route path="/login" element={<Login />} />

          {/* Protected routes - require authentication */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout>
                <FuelEventsList />
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
          
          <Route path="/driver/loans/:id" element={
            <ProtectedRoute>
              <Layout>
                <DriverLoans />
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
                <OilChangeList />
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

          {/* New Vendor Expense Routes - All restricted to permission level 3 or higher */}
          <Route path="/vendor-dashboard" element={
            <ProtectedRoute minPermissionLevel={REQUIRED_PERMISSION_LEVEL}>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/vendors" element={
            <ProtectedRoute minPermissionLevel={REQUIRED_PERMISSION_LEVEL}>
              <Layout>
                <VendorList />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/add-vendor" element={
            <ProtectedRoute minPermissionLevel={REQUIRED_PERMISSION_LEVEL}>
              <Layout>
                <VendorForm />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/edit-vendor/:vendorId" element={
            <ProtectedRoute minPermissionLevel={REQUIRED_PERMISSION_LEVEL}>
              <Layout>
                <VendorForm />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/vendor/:vendorId/expenses" element={
            <ProtectedRoute minPermissionLevel={REQUIRED_PERMISSION_LEVEL}>
              <Layout>
                <ExpenseList />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/expenses" element={
            <ProtectedRoute minPermissionLevel={REQUIRED_PERMISSION_LEVEL}>
              <Layout>
                <ExpenseList />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/add-expense/:vendorId?" element={
            <ProtectedRoute minPermissionLevel={REQUIRED_PERMISSION_LEVEL}>
              <Layout>
                <ExpenseForm />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/edit-expense/:vendorId/:expenseId" element={
            <ProtectedRoute minPermissionLevel={REQUIRED_PERMISSION_LEVEL}>
              <Layout>
                <ExpenseForm />
              </Layout>
            </ProtectedRoute>
          } />

          {/* Catch-all redirect to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;