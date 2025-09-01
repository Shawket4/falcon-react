import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Calendar, 
  User, 
  Hash, 
  Gauge, 
  MapPin,
  Building,
  AlertTriangle,
  CheckCircle,
  Eye,
  FileText
} from 'lucide-react';
import apiClient from '../../apiClient';

const ServiceInvoiceView = ({ invoice, car, onBack, onEdit }) => {
  const [invoiceData, setInvoiceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (invoice?.ID) {
      fetchInvoiceDetails();
    }
  }, [invoice?.ID]);

  const fetchInvoiceDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await apiClient.get(`/api/service-invoices/${invoice.ID}`);
      setInvoiceData(response.data.data);
    } catch (err) {
      console.error('Error fetching invoice details:', err);
      setError('Failed to load service record details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleteLoading(true);
      await apiClient.delete(`/api/service-invoices/${invoice.ID}`);
      onBack(); // Go back to list after successful deletion
    } catch (err) {
      console.error('Error deleting invoice:', err);
      setError('Failed to delete service record');
    } finally {
      setDeleteLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return 'Invalid Date';
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Invalid Date';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading service record...</p>
        </div>
      </div>
    );
  }

  if (error && !invoiceData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Record</h3>
            <p className="text-red-700">{error}</p>
            <button 
              onClick={onBack}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 p-6 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center">
              <button 
                onClick={onBack}
                className="mr-4 p-2 rounded-lg text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">Service Record #{invoiceData?.ID}</h1>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    Active
                  </span>
                </div>
                <p className="text-gray-600">
                  Vehicle: <span className="font-semibold text-gray-800">{car?.car_no_plate}</span>
                  {car?.car_type && <span className="text-gray-500"> • {car.car_type}</span>}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => onEdit(invoiceData)}
                className="flex items-center px-4 py-2 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Record
              </button>
              <button 
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-3" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Service Record Display */}
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-t-2xl border-2 border-gray-300 p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800">قائمة فحص خدمة</h1>
              <h2 className="text-2xl text-gray-600">الشاحنة</h2>
            </div>

            {/* Basic Information Grid - Read Only */}
            <div className="border-2 border-gray-300 p-6 mb-8 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="text-right">
                  <label className="block text-base font-medium text-gray-700 mb-2">التاريخ:</label>
                  <div className="w-full px-4 py-3 text-base border border-gray-300 rounded bg-white">
                    {formatDate(invoiceData?.date)}
                  </div>
                </div>
                <div className="text-right">
                  <label className="block text-base font-medium text-gray-700 mb-2">اسم السائق:</label>
                  <div className="w-full px-4 py-3 text-base border border-gray-300 rounded bg-white text-right">
                    {invoiceData?.driver_name || 'N/A'}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="text-right">
                  <label className="block text-base font-medium text-gray-700 mb-2">رقم اللوحة:</label>
                  <div className="w-full px-4 py-3 text-base border border-gray-300 rounded bg-gray-100 text-right">
                    {invoiceData?.plate_number || 'N/A'}
                  </div>
                </div>
                <div className="text-right">
                  <label className="block text-base font-medium text-gray-700 mb-2">قراءة العداد:</label>
                  <div className="w-full px-4 py-3 text-base border border-gray-300 rounded bg-white text-right">
                    {invoiceData?.meter_reading || 0} كم
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="text-right">
                  <label className="block text-base font-medium text-gray-700 mb-2">المشرف:</label>
                  <div className="w-full px-4 py-3 text-base border border-gray-300 rounded bg-white text-right">
                    {invoiceData?.supervisor || 'N/A'}
                  </div>
                </div>
                <div className="text-right">
                  <label className="block text-base font-medium text-gray-700 mb-2">منطقة التشغيل:</label>
                  <div className="w-full px-4 py-3 text-base border border-gray-300 rounded bg-white text-right">
                    {invoiceData?.operating_region || 'N/A'}
                  </div>
                </div>
              </div>
            </div>

            {/* Inspection Items Header */}
            <div className="bg-gray-100 border border-gray-300 p-4 mb-0">
              <h3 className="text-center text-xl font-medium text-gray-800">بنود الفحص والخدمة</h3>
            </div>

            {/* Inspection Table - Read Only */}
            <div className="border-l border-r border-b border-gray-300 mb-8">
              <div className="grid grid-cols-2 bg-gray-700 text-white">
                <div className="p-4 text-center font-medium text-base border-r border-gray-300">الملاحظات</div>
                <div className="p-4 text-center font-medium text-base">بند الخدمة</div>
              </div>

              {Array.from({ length: 15 }, (_, index) => {
                const item = invoiceData?.inspection_items?.find(item => item.item_order === index + 1) || { service: '', notes: '' };
                return (
                  <div key={index} className="grid grid-cols-2 border-b border-gray-300 last:border-b-0 min-h-[56px] bg-gray-50">
                    <div className="border-r border-gray-300 p-3 text-right text-base">
                      {item.notes || ''}
                    </div>
                    <div className="p-3 text-right text-base">
                      {item.service || ''}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Record Information */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Record Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Created:</p>
                  <p className="font-medium">{formatDateTime(invoiceData?.CreatedAt)}</p>
                </div>
                {invoiceData?.UpdatedAt !== invoiceData?.CreatedAt && (
                  <div>
                    <p className="text-gray-600">Last Updated:</p>
                    <p className="font-medium">{formatDateTime(invoiceData?.UpdatedAt)}</p>
                  </div>
                )}
                <div>
                  <p className="text-gray-600">Total Inspection Items:</p>
                  <p className="font-medium">
                    {invoiceData?.inspection_items?.filter(item => item.service || item.notes).length || 0} of 15
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Record ID:</p>
                  <p className="font-medium">#{invoiceData?.ID}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Delete Service Record</h3>
                  <p className="text-sm text-gray-500">Record #{invoiceData?.ID}</p>
                </div>
              </div>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this service record? This action cannot be undone.
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteLoading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  {deleteLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Deleting...
                    </>
                  ) : (
                    'Delete Record'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceInvoiceView;