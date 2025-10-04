import React, { useState, useEffect } from 'react';
import { X, Package, Building2, CheckCircle, Clock, AlertCircle, Trash2, Stamp } from 'lucide-react';

const ReceiptDialog = ({ isOpen, onClose, tripId, apiClient }) => {
  const [tripDetails, setTripDetails] = useState(null);
  const [receiptSteps, setReceiptSteps] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const [newStep, setNewStep] = useState({
    location: '',
    received_by: '',
    stamped: false,
    notes: ''
  });

  useEffect(() => {
    if (isOpen && tripId) {
      fetchTripReceipts();
    } else {
      resetForm();
    }
  }, [isOpen, tripId]);

  const resetForm = () => {
    setNewStep({ location: '', received_by: '', stamped: false, notes: '' });
    setError('');
    setSuccessMessage('');
  };

  const fetchTripReceipts = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await apiClient.get(`/api/receipts/trip/${tripId}`);
      setTripDetails(response.data.trip);
      setReceiptSteps(response.data.steps || []);
    } catch (err) {
      setError('Failed to load receipt details. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddStep = async () => {
    if (!newStep.location || !newStep.received_by.trim()) {
      setError('Please select a location and enter who received it');
      return;
    }

    setIsSaving(true);
    setError('');
    setSuccessMessage('');
    
    try {
      await apiClient.post('/api/receipts/step', {
        trip_id: tripId,
        location: newStep.location,
        received_by: newStep.received_by.trim(),
        stamped: newStep.stamped,
        notes: newStep.notes.trim()
      });
      
      setSuccessMessage(`Receipt recorded at ${newStep.location}`);
      resetForm();
      await fetchTripReceipts();
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add step. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

   const toggleStamped = async (step) => {
    try {
      await apiClient.put(`/api/receipts/step/${step.ID}`, {
        stamped: !step.stamped
      });
      await fetchTripReceipts();
    } catch (err) {
      setError('Failed to update stamp status');
    }
  };

  const handleDeleteStep = async (stepId) => {
    if (!window.confirm('Delete this receipt step? This action cannot be undone.')) {
      return;
    }

    setError('');
    try {
      await apiClient.delete(`/api/receipts/step/${stepId}`);
      setSuccessMessage('Step deleted');
      await fetchTripReceipts();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete step');
    }
  };

  const getAvailableLocations = () => {
    const usedLocations = receiptSteps.map(step => step.location);
    return ['Garage', 'Office'].filter(loc => !usedLocations.includes(loc));
  };

  const getStatusInfo = () => {
    const count = receiptSteps.length;
    if (count === 0) {
      return { status: 'Pending', color: 'bg-gray-100 text-gray-800 border-gray-200', icon: Clock };
    }
    if (count === 1) {
      return { status: 'In Progress', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Package };
    }
    return { status: 'Complete', color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle };
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  const statusInfo = getStatusInfo();
  const availableLocations = getAvailableLocations();
  const canAddStep = receiptSteps.length < 2;
  const StatusIcon = statusInfo.icon;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Package className="h-6 w-6 text-white" />
            </div>
            <div className="text-white">
              <h2 className="text-xl font-bold">Receipt Management</h2>
              {tripDetails && (
                <p className="text-blue-100 text-sm">
                  #{tripDetails.receipt_no} • {tripDetails.company}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-all"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Alert Messages */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start space-x-3 animate-in slide-in-from-top-2 duration-300">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm flex-1">{error}</p>
              <button onClick={() => setError('')} className="text-red-400 hover:text-red-600">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {successMessage && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg flex items-start space-x-3 animate-in slide-in-from-top-2 duration-300">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <p className="text-green-700 text-sm flex-1">{successMessage}</p>
            </div>
          )}

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mb-4"></div>
              <p className="text-gray-500">Loading receipt details...</p>
            </div>
          ) : (
            <>
              {/* Trip Details */}
              {tripDetails && (
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Trip Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Date</p>
                      <p className="text-sm font-semibold text-gray-900">{tripDetails.date}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Vehicle</p>
                      <p className="text-sm font-semibold text-gray-900">{tripDetails.car_no_plate}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Terminal</p>
                      <p className="text-sm font-semibold text-gray-900">{tripDetails.terminal}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Drop-off</p>
                      <p className="text-sm font-semibold text-gray-900">{tripDetails.drop_off_point}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Receipt Status</h3>
                <div className={`inline-flex items-center px-4 py-2 rounded-full border ${statusInfo.color} font-semibold text-sm`}>
                  <StatusIcon className="h-4 w-4 mr-2" />
                  {statusInfo.status}
                </div>
              </div>

              {/* Timeline */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">Receipt Journey</h3>
                
                {receiptSteps.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">No steps recorded</p>
                    <p className="text-gray-400 text-sm mt-1">Add the first step below</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {receiptSteps.sort((a, b) => new Date(a.received_at) - new Date(b.received_at)).map((step, index) => {
                      const Icon = step.location === 'Garage' ? Package : Building2;
                      const isGarage = step.location === 'Garage';
                      
                      return (
                        <div key={step.ID} className="flex items-start group">
                          <div className="flex flex-col items-center mr-4 flex-shrink-0">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              isGarage ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                            }`}>
                              <Icon className="h-5 w-5" />
                            </div>
                            {index < receiptSteps.length - 1 && (
                              <div className="w-0.5 h-8 bg-gradient-to-b from-gray-300 to-transparent my-1"></div>
                            )}
                          </div>
                          
                          <div className="flex-1 bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <h4 className="font-bold text-gray-900">{step.location}</h4>
                                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                                    isGarage ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                                  }`}>
                                    Step {index + 1}
                                  </span>
                                  {step.stamped && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 flex items-center">
                                  <Stamp className="h-3 w-3 mr-1" />
                                  Stamped
                                </span>
                              )}
                                </div>
                                <p className="text-sm text-gray-600">Received by: <span className="font-medium text-gray-900">{step.received_by}</span></p>
                                <p className="text-xs text-gray-400 mt-1">{formatDateTime(step.received_at)}</p>
                              </div>
                             <div className="flex items-center space-x-2">
                            {/* ADD STAMP TOGGLE BUTTON */}
                            <button
                              onClick={() => toggleStamped(step)}
                              className={`p-2 rounded-lg transition-all ${
                                step.stamped 
                                  ? 'bg-purple-100 text-purple-600 hover:bg-purple-200' 
                                  : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                              }`}
                              title={step.stamped ? 'Mark as not stamped' : 'Mark as stamped'}
                            >
                              <Stamp className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteStep(step.ID)}
                              className="text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all p-1 hover:bg-red-50 rounded"
                              title="Delete step"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                            {step.notes && (
                              <div className="mt-3 bg-gray-50 rounded-lg p-3 border border-gray-200">
                                <p className="text-xs text-gray-500 mb-1 font-semibold">Notes:</p>
                                <p className="text-sm text-gray-700">{step.notes}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Add Step Form */}
              {canAddStep && availableLocations.length > 0 ? (
                <div className="border-t-2 border-gray-100 pt-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
                    Add Receipt Step
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Location <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={newStep.location}
                        onChange={(e) => setNewStep({ ...newStep, location: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      >
                        <option value="">Choose location...</option>
                        {availableLocations.map(location => (
                          <option key={location} value={location}>
                            {location === 'Garage' ? '📦 Garage' : '🏢 Office'}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Received By <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={newStep.received_by}
                        onChange={(e) => setNewStep({ ...newStep, received_by: e.target.value })}
                        placeholder="Enter person's name"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>

                    <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="stamped"
                    checked={newStep.stamped}
                    onChange={(e) => setNewStep({ ...newStep, stamped: e.target.checked })}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <label htmlFor="stamped" className="text-sm font-medium text-gray-700 flex items-center">
                    <Stamp className="h-4 w-4 mr-2 text-purple-600" />
                    Mark as stamped
                  </label>
                </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Notes <span className="text-gray-400 text-xs font-normal">(Optional)</span>
                      </label>
                      <textarea
                        value={newStep.notes}
                        onChange={(e) => setNewStep({ ...newStep, notes: e.target.value })}
                        placeholder="Add any additional information..."
                        rows={3}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                      />
                    </div>

                    <button
                      onClick={handleAddStep}
                      disabled={isSaving || !newStep.received_by.trim() || !newStep.location}
                      className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all font-semibold shadow-lg hover:shadow-xl disabled:shadow-none flex items-center justify-center space-x-2"
                    >
                      {isSaving ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-5 w-5" />
                          <span>Record Receipt at {newStep.location || 'Location'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : !canAddStep && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 text-center">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
                  <p className="text-green-800 font-bold text-lg">Receipt Complete!</p>
                  <p className="text-green-600 text-sm mt-2">This receipt has been processed through both locations.</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptDialog;