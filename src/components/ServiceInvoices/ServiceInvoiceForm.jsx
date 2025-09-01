import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Save, 
  X, 
  AlertTriangle,
  CheckCircle,
  Loader
} from 'lucide-react';
import apiClient from '../../apiClient';

const ServiceInvoiceForm = ({ car, invoice, isEditMode, onBack, onSuccess }) => {
  const [formData, setFormData] = useState({
    car_id: car?.ID || '',
    driver_name: '',
    date: '',
    meter_reading: '',
    plate_number: car?.car_no_plate || '',
    supervisor: '',
    operating_region: '',
    inspection_items: Array(15).fill().map(() => ({ service: '', notes: '' }))
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (isEditMode && invoice) {
      fetchInvoiceDetails();
    } else {
      // Set today's date for new invoices
      const today = new Date().toISOString().split('T')[0];
      setFormData(prev => ({
        ...prev,
        date: today,
        car_id: car?.ID || '',
        plate_number: car?.car_no_plate || ''
      }));
    }
  }, [isEditMode, invoice, car]);

  const fetchInvoiceDetails = async () => {
    if (!invoice?.ID) return;
    
    try {
      setLoading(true);
      const response = await apiClient.get(`/api/service-invoices/${invoice.ID}`);
      const invoiceData = response.data.data;
      
      // Prepare inspection items array
      const inspectionItems = Array(15).fill().map((_, index) => {
        const item = invoiceData.inspection_items?.find(item => item.item_order === index + 1);
        return item ? { service: item.service, notes: item.notes } : { service: '', notes: '' };
      });

      setFormData({
        car_id: invoiceData.car_id,
        driver_name: invoiceData.driver_name || '',
        date: invoiceData.date ? invoiceData.date.split('T')[0] : '',
        meter_reading: invoiceData.meter_reading?.toString() || '',
        plate_number: invoiceData.plate_number || '',
        supervisor: invoiceData.supervisor || '',
        operating_region: invoiceData.operating_region || '',
        inspection_items: inspectionItems
      });
    } catch (err) {
      console.error('Error fetching invoice details:', err);
      setError('Failed to load service record details');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
    if (error) setError('');
  };

  const handleInspectionItemChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      inspection_items: prev.inspection_items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.driver_name.trim()) {
      errors.driver_name = 'Driver name is required';
    }
    
    if (!formData.date) {
      errors.date = 'Date is required';
    }
    
    if (!formData.meter_reading || isNaN(formData.meter_reading) || formData.meter_reading < 0) {
      errors.meter_reading = 'Valid meter reading is required';
    }
    
    if (!formData.supervisor.trim()) {
      errors.supervisor = 'Supervisor is required';
    }
    
    if (!formData.operating_region.trim()) {
      errors.operating_region = 'Operating region is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      setError('Please fix the errors below');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const submitData = {
        car_id: parseInt(formData.car_id),
        driver_name: formData.driver_name.trim(),
        date: formData.date,
        meter_reading: parseInt(formData.meter_reading),
        plate_number: formData.plate_number.trim(),
        supervisor: formData.supervisor.trim(),
        operating_region: formData.operating_region.trim(),
        inspection_items: formData.inspection_items.filter(item => 
          item.service.trim() || item.notes.trim()
        )
      };

      let response;
      if (isEditMode && invoice?.ID) {
        response = await apiClient.put(`/api/service-invoices/${invoice.ID}`, submitData);
      } else {
        response = await apiClient.post('/api/service-invoices', submitData);
      }

      if (response.status === 200 || response.status === 201) {
        setSuccess(isEditMode ? 'Service record updated successfully!' : 'Service record created successfully!');
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }
    } catch (err) {
      console.error('Error saving service record:', err);
      const errorMessage = err.response?.data?.message || 'Failed to save service record';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const clearInspectionItem = (index) => {
    handleInspectionItemChange(index, 'service', '');
    handleInspectionItemChange(index, 'notes', '');
  };

  const getInputClassName = (fieldName) => {
    const baseClasses = "w-full px-4 py-3 text-base border rounded focus:outline-none focus:ring-2 focus:ring-blue-500";
    const errorClasses = validationErrors[fieldName] ? "border-red-300 focus:border-red-500" : "border-gray-300 focus:border-blue-500";
    return `${baseClasses} ${errorClasses}`;
  };

  if (loading && isEditMode && !formData.driver_name) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading service record...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      {/* Mobile Header - Fixed at top */}
      <div className="lg:hidden bg-white/90 backdrop-blur-sm shadow-sm border-b border-gray-200 p-4 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <button 
            onClick={onBack}
            disabled={loading}
            className="p-2 rounded-lg text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="text-center">
            <h1 className="text-lg font-bold text-gray-900">
              {isEditMode ? 'Edit Service' : 'Add Service'}
            </h1>
            <p className="text-sm text-gray-600">{car?.car_no_plate}</p>
          </div>
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:bg-blue-400 transition-colors flex items-center"
          >
            {loading ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Save className="h-4 w-4 mr-1" />
                Save
              </>
            )}
          </button>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button 
                  onClick={onBack}
                  disabled={loading}
                  className="mr-4 p-2 rounded-lg text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-1">
                    {isEditMode ? 'Edit Service Record' : 'Add Service Record'}
                  </h1>
                  <p className="text-gray-600">
                    Vehicle: <span className="font-semibold text-gray-800">{car?.car_no_plate}</span>
                    {car?.car_type && <span className="text-gray-500"> • {car.car_type}</span>}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success/Error Messages - Fixed positioning on mobile */}
      {(error || success) && (
        <div className="lg:container lg:mx-auto lg:px-4 lg:sm:px-6 lg:lg:px-8 px-4 mb-4 lg:mb-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" />
                <p className="text-red-700 text-sm lg:text-base">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                <p className="text-green-700 text-sm lg:text-base">{success}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Form Container - Full width on mobile with horizontal scroll */}
      <div className="lg:container lg:mx-auto lg:px-4 lg:sm:px-6 lg:lg:px-8">
        <div className="lg:max-w-6xl lg:mx-auto">
          {/* Mobile: Allow horizontal scrolling for wide form with zoom out effect */}
          <div className="lg:hidden overflow-x-auto px-2">
            <div className="transform scale-75 origin-top-left" style={{ width: '133.33%' }}>
              <div className="bg-white rounded-2xl border-2 border-gray-300 p-8 mb-20" style={{ minWidth: '800px' }}>
                {/* Form Content */}
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold text-gray-800">قائمة فحص خدمة</h1>
                  <h2 className="text-2xl text-gray-600">الشاحنة</h2>
                </div>

                {/* Basic Information Grid - Mobile optimized */}
                <div className="border-2 border-gray-300 p-6 mb-8">
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div className="text-right">
                      <label className="block text-base font-medium text-gray-700 mb-2">
                        التاريخ: <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => handleInputChange('date', e.target.value)}
                        className={`${getInputClassName('date')}`}
                        required
                      />
                      {validationErrors.date && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.date}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <label className="block text-base font-medium text-gray-700 mb-2">
                        اسم السائق: <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.driver_name}
                        onChange={(e) => handleInputChange('driver_name', e.target.value)}
                        className={`${getInputClassName('driver_name')} text-right`}
                        placeholder="أدخل اسم السائق"
                        required
                      />
                      {validationErrors.driver_name && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.driver_name}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div className="text-right">
                      <label className="block text-base font-medium text-gray-700 mb-2">رقم اللوحة:</label>
                      <input
                        type="text"
                        value={formData.plate_number}
                        readOnly
                        className="w-full px-4 py-3 text-base border border-gray-300 rounded bg-gray-100 text-right"
                      />
                    </div>
                    <div className="text-right">
                      <label className="block text-base font-medium text-gray-700 mb-2">
                        قراءة العداد: <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={formData.meter_reading}
                        onChange={(e) => handleInputChange('meter_reading', e.target.value)}
                        className={`${getInputClassName('meter_reading')} text-right`}
                        placeholder="أدخل قراءة العداد"
                        min="0"
                        required
                      />
                      {validationErrors.meter_reading && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.meter_reading}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="text-right">
                      <label className="block text-base font-medium text-gray-700 mb-2">
                        المشرف: <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.supervisor}
                        onChange={(e) => handleInputChange('supervisor', e.target.value)}
                        className={`${getInputClassName('supervisor')} text-right`}
                        placeholder="أدخل اسم المشرف"
                        required
                      />
                      {validationErrors.supervisor && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.supervisor}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <label className="block text-base font-medium text-gray-700 mb-2">
                        منطقة التشغيل: <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.operating_region}
                        onChange={(e) => handleInputChange('operating_region', e.target.value)}
                        className={`${getInputClassName('operating_region')} text-right`}
                        placeholder="أدخل منطقة التشغيل"
                        required
                      />
                      {validationErrors.operating_region && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.operating_region}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Inspection Items Header */}
                <div className="bg-gray-100 border border-gray-300 p-4 mb-0">
                  <h3 className="text-center text-xl font-medium text-gray-800">بنود الفحص والخدمة</h3>
                </div>

                {/* Inspection Table */}
                <div className="border-l border-r border-b border-gray-300 mb-8">
                  <div className="grid grid-cols-2 bg-gray-700 text-white">
                    <div className="p-4 text-center font-medium text-base border-r border-gray-300">الملاحظات</div>
                    <div className="p-4 text-center font-medium text-base">بند الخدمة</div>
                  </div>

                  {formData.inspection_items.map((item, index) => (
                    <div key={index} className="grid grid-cols-2 border-b border-gray-300 last:border-b-0 min-h-[56px] hover:bg-gray-50 transition-colors group">
                      <div className="border-r border-gray-300 relative">
                        <textarea
                          value={item.notes}
                          onChange={(e) => handleInspectionItemChange(index, 'notes', e.target.value)}
                          className="w-full h-14 p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-right text-base border-0 bg-transparent"
                          placeholder="ملاحظات..."
                        />
                        {(item.service || item.notes) && (
                          <button
                            type="button"
                            onClick={() => clearInspectionItem(index)}
                            className="absolute top-2 left-2 p-1 bg-red-100 text-red-600 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-200 transition-all"
                            title="Clear this item"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          value={item.service}
                          onChange={(e) => handleInspectionItemChange(index, 'service', e.target.value)}
                          className="w-full h-14 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-right text-base border-0 bg-transparent"
                          placeholder={`بند الخدمة ${index + 1}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action Buttons - Mobile (within scaled container) */}
                <div className="flex justify-center">
                  <div className="flex space-x-6">
                    <button
                      type="button"
                      onClick={onBack}
                      disabled={loading}
                      className="px-8 py-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      إلغاء
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={loading}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-4 px-10 rounded-lg transition duration-200 text-lg flex items-center disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <Loader className="w-5 h-5 animate-spin ml-3" />
                          {isEditMode ? 'جاري التحديث...' : 'جاري الحفظ...'}
                        </>
                      ) : (
                        <>
                          <Save className="h-5 w-5 ml-3" />
                          {isEditMode ? 'تحديث السجل' : 'حفظ السجل'}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop: Normal layout */}
          <div className="hidden lg:block">
            <div className="bg-white rounded-2xl border-2 border-gray-300 p-8">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">قائمة فحص خدمة</h1>
                <h2 className="text-2xl text-gray-600">الشاحنة</h2>
              </div>

              {/* Basic Information Grid */}
              <div className="border-2 border-gray-300 p-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="text-right">
                    <label className="block text-base font-medium text-gray-700 mb-2">
                      التاريخ: <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleInputChange('date', e.target.value)}
                      className={getInputClassName('date')}
                      required
                    />
                    {validationErrors.date && (
                      <p className="text-red-500 text-sm mt-1">{validationErrors.date}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <label className="block text-base font-medium text-gray-700 mb-2">
                      اسم السائق: <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.driver_name}
                      onChange={(e) => handleInputChange('driver_name', e.target.value)}
                      className={`${getInputClassName('driver_name')} text-right`}
                      placeholder="أدخل اسم السائق"
                      required
                    />
                    {validationErrors.driver_name && (
                      <p className="text-red-500 text-sm mt-1">{validationErrors.driver_name}</p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="text-right">
                    <label className="block text-base font-medium text-gray-700 mb-2">رقم اللوحة:</label>
                    <input
                      type="text"
                      value={formData.plate_number}
                      readOnly
                      className="w-full px-4 py-3 text-base border border-gray-300 rounded bg-gray-100 text-right"
                    />
                  </div>
                  <div className="text-right">
                    <label className="block text-base font-medium text-gray-700 mb-2">
                      قراءة العداد: <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.meter_reading}
                      onChange={(e) => handleInputChange('meter_reading', e.target.value)}
                      className={`${getInputClassName('meter_reading')} text-right`}
                      placeholder="أدخل قراءة العداد"
                      min="0"
                      required
                    />
                    {validationErrors.meter_reading && (
                      <p className="text-red-500 text-sm mt-1">{validationErrors.meter_reading}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="text-right">
                    <label className="block text-base font-medium text-gray-700 mb-2">
                      المشرف: <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.supervisor}
                      onChange={(e) => handleInputChange('supervisor', e.target.value)}
                      className={`${getInputClassName('supervisor')} text-right`}
                      placeholder="أدخل اسم المشرف"
                      required
                    />
                    {validationErrors.supervisor && (
                      <p className="text-red-500 text-sm mt-1">{validationErrors.supervisor}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <label className="block text-base font-medium text-gray-700 mb-2">
                      منطقة التشغيل: <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.operating_region}
                      onChange={(e) => handleInputChange('operating_region', e.target.value)}
                      className={`${getInputClassName('operating_region')} text-right`}
                      placeholder="أدخل منطقة التشغيل"
                      required
                    />
                    {validationErrors.operating_region && (
                      <p className="text-red-500 text-sm mt-1">{validationErrors.operating_region}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Inspection Items Header */}
              <div className="bg-gray-100 border border-gray-300 p-4 mb-0">
                <h3 className="text-center text-xl font-medium text-gray-800">بنود الفحص والخدمة</h3>
              </div>

              {/* Inspection Table */}
              <div className="border-l border-r border-b border-gray-300 mb-8">
                <div className="grid grid-cols-2 bg-gray-700 text-white">
                  <div className="p-4 text-center font-medium text-base border-r border-gray-300">الملاحظات</div>
                  <div className="p-4 text-center font-medium text-base">بند الخدمة</div>
                </div>

                {formData.inspection_items.map((item, index) => (
                  <div key={index} className="grid grid-cols-2 border-b border-gray-300 last:border-b-0 min-h-[56px] hover:bg-gray-50 transition-colors group">
                    <div className="border-r border-gray-300 relative">
                      <textarea
                        value={item.notes}
                        onChange={(e) => handleInspectionItemChange(index, 'notes', e.target.value)}
                        className="w-full h-14 p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-right text-base border-0 bg-transparent"
                        placeholder="ملاحظات..."
                      />
                      {(item.service || item.notes) && (
                        <button
                          type="button"
                          onClick={() => clearInspectionItem(index)}
                          className="absolute top-2 left-2 p-1 bg-red-100 text-red-600 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-200 transition-all"
                          title="Clear this item"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        value={item.service}
                        onChange={(e) => handleInspectionItemChange(index, 'service', e.target.value)}
                        className="w-full h-14 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-right text-base border-0 bg-transparent"
                        placeholder={`بند الخدمة ${index + 1}`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons - Desktop */}
              <div className="flex justify-center">
                <div className="flex space-x-6">
                  <button
                    type="button"
                    onClick={onBack}
                    disabled={loading}
                    className="px-8 py-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    إلغاء
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-4 px-10 rounded-lg transition duration-200 text-lg flex items-center disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin ml-3" />
                        {isEditMode ? 'جاري التحديث...' : 'جاري الحفظ...'}
                      </>
                    ) : (
                      <>
                        <Save className="h-5 w-5 ml-3" />
                        {isEditMode ? 'تحديث السجل' : 'حفظ السجل'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Spacing */}
      <div className="lg:hidden h-20"></div>
    </div>
  );
};

export default ServiceInvoiceForm;