import React, { useState } from 'react';
import CarsListView from './CarsListView';
import ServiceInvoicesView from './ServiceInvoicesView';
import ServiceInvoiceView from './ServiceInvoiceView';
import ServiceInvoiceForm from './ServiceInvoiceForm';

const CarServiceManagement = () => {
  const [currentView, setCurrentView] = useState('carsList');
  const [selectedCar, setSelectedCar] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Navigation handlers
  const handleViewServiceInvoices = (car) => {
    setSelectedCar(car);
    setSelectedInvoice(null);
    setIsEditMode(false);
    setCurrentView('serviceInvoices');
  };

  const handleViewServiceInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setIsEditMode(false);
    setCurrentView('serviceView');
  };

  const handleAddServiceInvoice = () => {
    setSelectedInvoice(null);
    setIsEditMode(false);
    setCurrentView('serviceForm');
  };

  const handleEditServiceInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setIsEditMode(true);
    setCurrentView('serviceForm');
  };

  const handleBackToCarsList = () => {
    setCurrentView('carsList');
    setSelectedCar(null);
    setSelectedInvoice(null);
    setIsEditMode(false);
  };

  const handleBackToServiceInvoices = () => {
    setCurrentView('serviceInvoices');
    setSelectedInvoice(null);
    setIsEditMode(false);
  };

  const handleFormSuccess = () => {
    // Refresh the service invoices list
    setCurrentView('serviceInvoices');
    setSelectedInvoice(null);
    setIsEditMode(false);
  };

  const handleViewSuccess = () => {
    // Go back to invoices list after successful delete
    setCurrentView('serviceInvoices');
    setSelectedInvoice(null);
    setIsEditMode(false);
  };

  // Render current view
  const renderCurrentView = () => {
    switch (currentView) {
      case 'carsList':
        return (
          <CarsListView 
            onViewServiceInvoices={handleViewServiceInvoices} 
          />
        );
        
      case 'serviceInvoices':
        return (
          <ServiceInvoicesView 
            car={selectedCar}
            onBack={handleBackToCarsList}
            onAdd={handleAddServiceInvoice}
            onEdit={handleEditServiceInvoice}
            onView={handleViewServiceInvoice}
          />
        );
        
      case 'serviceView':
        return (
          <ServiceInvoiceView 
            invoice={selectedInvoice}
            car={selectedCar}
            onBack={handleBackToServiceInvoices}
            onEdit={handleEditServiceInvoice}
            onSuccess={handleViewSuccess}
          />
        );
        
      case 'serviceForm':
        return (
          <ServiceInvoiceForm 
            car={selectedCar}
            invoice={selectedInvoice}
            isEditMode={isEditMode}
            onBack={handleBackToServiceInvoices}
            onSuccess={handleFormSuccess}
          />
        );
        
      default:
        return (
          <CarsListView 
            onViewServiceInvoices={handleViewServiceInvoices} 
          />
        );
    }
  };

  return (
    <div className="min-h-screen">
      {renderCurrentView()}
    </div>
  );
};

export default CarServiceManagement;