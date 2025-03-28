import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../apiClient';
import { Camera, X } from 'lucide-react';
// Import Tesseract.js
import * as Tesseract from 'tesseract.js';

function CreateTire() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const photoRef = useRef(null);
  const [tireData, setTireData] = useState({
    serial: '',
    brand: '',
    model: '',
    size: '',
    manufacture_date: '',
    purchase_date: '',
    status: 'in-use'
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({});
  const [showCamera, setShowCamera] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [processing, setProcessing] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // If this is the serial/DOT code field and it has content
    if (name === 'serial' && value.trim()) {
      // Check if the input contains "DOT" at the beginning
      if (value.toUpperCase().startsWith("DOT")) {
        // Extract just the code part after "DOT" and any spaces
        const codeOnly = value.substring(3).trim();
        setTireData({ ...tireData, [name]: codeOnly });
        
        // Clear any error message if it was related to missing DOT prefix
        if (error && error.includes("No DOT prefix detected")) {
          setError(null);
        }
      } else {
        // If manually entering without DOT prefix, just use as is
        setTireData({ ...tireData, [name]: value });
        
        // Show a warning that DOT prefix is missing
        setError("Warning: No DOT prefix detected. Please ensure this is a valid tire identification code.");
      }
    } else {
      // For all other fields, just update normally
      setTireData({ ...tireData, [name]: value });
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched({ ...touched, [name]: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (!tireData.serial.trim()) {
        throw new Error('Serial number is required');
      }
      
      if (!tireData.brand.trim()) {
        throw new Error('Brand is required');
      }

      await apiClient.post('/tires', tireData);
      setLoading(false);
      navigate('/tires'); // Redirect to tire list
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.error || err.message || 'Failed to create tire');
    }
  };

  // Start the camera
  const startCamera = async () => {
    try {
      setShowCamera(true);
      setCameraActive(true);
      
      // Check if camera API is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API is not supported in this browser or environment');
      }
      
      // Optimize camera settings for text recognition
      const constraints = {
        video: { 
          facingMode: 'environment', // Use the back camera if available
          width: { ideal: 1920 }, // Higher resolution
          height: { ideal: 1080 },
          // Try to optimize for text capture
          advanced: [
            { zoom: { ideal: 2.0 } }, // Zoom in if supported
            { focusMode: { ideal: "continuous" } }, // Continuous autofocus
            { whiteBalanceMode: { ideal: "continuous" } }, // Auto white balance
            { exposureMode: { ideal: "continuous" } } // Continuous exposure
          ]
        }
      };
      
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error('Camera error:', err);
      setError('Failed to access camera: ' + (err.message || 'Camera not available'));
      setShowCamera(false);
      setCameraActive(false);
      
      // Fallback to manual entry mode
      setTimeout(() => {
        setError('Please enter the DOT code manually');
      }, 3000);
    }
  };

  // Stop the camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
    setCameraActive(false);
    setCapturedImage(null);
  };

  // Capture photo from camera with better focus for OCR
  const capturePhoto = () => {
    if (!videoRef.current || !photoRef.current) return;
    
    const video = videoRef.current;
    const canvas = photoRef.current;
    const context = canvas.getContext('2d');
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw the current frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Image processing to improve OCR results
    try {
      // Increase contrast to make text more visible
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Simple contrast adjustment
      const contrast = 1.5; // Increase contrast
      const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
      
      for (let i = 0; i < data.length; i += 4) {
        data[i] = factor * (data[i] - 128) + 128; // red
        data[i+1] = factor * (data[i+1] - 128) + 128; // green
        data[i+2] = factor * (data[i+2] - 128) + 128; // blue
      }
      
      context.putImageData(imageData, 0, 0);
    } catch (err) {
      console.error("Error during image processing:", err);
      // Continue even if image processing fails
    }
    
    // Get the captured image as data URL
    const imageData = canvas.toDataURL('image/jpeg', 0.95); // High quality JPEG
    setCapturedImage(imageData);
    
    // Stop the camera after capturing
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCameraActive(false);
  };

  // Process the captured image to extract DOT code using Tesseract OCR
  const processImage = async () => {
    setProcessing(true);
    setError(null);
    
    try {
      // Make sure we have a captured image
      if (!capturedImage) {
        throw new Error("No image captured");
      }
      
      // Use Tesseract.js to recognize text in the image
      const result = await Tesseract.recognize(
        capturedImage,
        'eng', // Use English language
        { 
          logger: m => console.log(m), // Optional logging
          // Tesseract configuration to improve detection of alphanumeric codes
          tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ', 
        }
      );
      
      // Get the recognized text
      const recognizedText = result.data.text.trim();
      console.log("OCR Result:", recognizedText);
      
      // Check if any text was detected
      if (!recognizedText) {
        throw new Error("No text detected in image. Please try again with better lighting or focus.");
      }
      
      // Look for DOT pattern in the text
      // This regex will try to find "DOT" followed by any characters
      const dotPattern = /DOT\s+([A-Z0-9\s]+)/i;
      const match = recognizedText.match(dotPattern);
      
      let codeOnly = "";
      
      if (match && match[1]) {
        // Found DOT pattern, extract the code part
        codeOnly = match[1].trim();
        console.log("Extracted code:", codeOnly);
      } else {
        // No DOT pattern found, use the whole text but show a warning
        codeOnly = recognizedText;
        setError("Warning: No DOT prefix detected in the scanned code. Please verify the input.");
      }
      
      // Update the serial field with just the code part
      setTireData(prev => ({ ...prev, serial: codeOnly }));
      
      // Close the camera view
      setShowCamera(false);
      setCapturedImage(null);
    } catch (err) {
      console.error("OCR processing error:", err);
      setError(err.message || "Failed to process image. Please try again or enter manually.");
    } finally {
      setProcessing(false);
    }
  };

  // Retake photo
  const retakePhoto = async () => {
    setCapturedImage(null);
    
    try {
      // Check if camera API is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API is not supported in this browser or environment');
      }
      
      // Restart the camera
      const constraints = {
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };
      
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
        setCameraActive(true);
      }
    } catch (err) {
      console.error('Camera restart error:', err);
      setError('Failed to restart camera: ' + (err.message || 'Camera not available'));
      stopCamera(); // Close camera modal on error
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      {/* Back button */}
      <button 
        onClick={() => navigate('/tires')}
        className="group mb-6 inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-900 transition-colors duration-200"
      >
        <svg 
          className="mr-2 h-4 w-4 transform transition-transform duration-200 group-hover:-translate-x-1" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Tire Inventory
      </button>
      
      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="bg-white rounded-lg shadow-xl overflow-hidden w-full max-w-lg">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                {capturedImage ? 'Confirm DOT Code' : 'Capture DOT Code'}
              </h3>
              <button 
                onClick={stopCamera}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-4">
              {capturedImage ? (
                <div className="space-y-4">
                  <div className="bg-black flex justify-center">
                    <img 
                      src={capturedImage} 
                      alt="Captured DOT code" 
                      className="max-h-64 max-w-full object-contain"
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={retakePhoto}
                      disabled={processing}
                      className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Retake
                    </button>
                    <button
                      onClick={processImage}
                      disabled={processing}
                      className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      {processing ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing with OCR...
                        </span>
                      ) : (
                        'Confirm & Extract'
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-black relative flex justify-center">
                    <video 
                      ref={videoRef} 
                      className="max-h-64 max-w-full"
                      autoPlay
                      playsInline
                      muted
                    />
                    <div className="absolute inset-0 border-2 border-yellow-400 border-dashed opacity-50 pointer-events-none"></div>
                    <div className="absolute bottom-2 left-2 right-2 text-white text-xs bg-black bg-opacity-70 p-2 rounded">
                      Position the DOT code in good lighting with high contrast. Hold steady for best results.
                    </div>
                  </div>
                  <button
                    onClick={capturePhoto}
                    disabled={!cameraActive}
                    className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Capture DOT Code
                  </button>
                </div>
              )}
              
              {/* Hidden canvas for capturing still image */}
              <canvas ref={photoRef} style={{ display: 'none' }} />
            </div>
          </div>
        </div>
      )}
      
      {/* Main card */}
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header section */}
        <div className="relative h-16">
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-white"></div>
        </div>
        
        {/* Form content */}
        <div className="px-6 py-8 sm:px-10 -mt-8 relative">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
              Add New Tire
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Enter the details for the new tire to add to your inventory
            </p>
          </div>
          
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Serial Number with Camera Button */}
            <div className="relative">
              <div className="flex">
                <input
                  id="serial"
                  name="serial"
                  type="text"
                  required
                  value={tireData.serial}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`peer block w-full px-4 py-3 rounded-l-xl border-2 border-r-0 border-gray-200 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200
                    ${touched.serial && !tireData.serial ? 'border-red-300 focus:ring-red-500' : ''}`}
                  placeholder="DOT Code"
                />
                <button 
                  type="button"
                  onClick={startCamera}
                  className="flex items-center justify-center px-4 border-2 border-gray-200 border-l-0 rounded-r-xl bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
                  title="Scan DOT code with camera (if available)"
                >
                  <Camera className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">Enter only the code part (e.g., "J3J9 1001" without "DOT")</p>
              <label
                htmlFor="serial"
                className={`absolute left-2 -top-2.5 px-1 text-sm transition-all duration-200 
                  peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base peer-placeholder-shown:top-3.5 peer-placeholder-shown:left-4
                  peer-focus:-top-2.5 peer-focus:left-2 peer-focus:text-sm peer-focus:text-indigo-600 
                  bg-white
                  ${touched.serial && !tireData.serial ? 'text-red-500 peer-focus:text-red-500' : 'text-gray-600'}`}
              >
                Tire Code *
              </label>
              {touched.serial && !tireData.serial && (
                <p className="mt-1 text-xs text-red-500">DOT code is required</p>
              )}
            </div>
            
            {/* Brand */}
            <div className="relative">
              <input
                id="brand"
                name="brand"
                type="text"
                required
                value={tireData.brand}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`peer block w-full px-4 py-3 rounded-xl border-2 border-gray-200 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200
                  ${touched.brand && !tireData.brand ? 'border-red-300 focus:ring-red-500' : ''}`}
                placeholder="Brand"
              />
              <label
                htmlFor="brand"
                className={`absolute left-2 -top-2.5 px-1 text-sm transition-all duration-200 
                  peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base peer-placeholder-shown:top-3.5 peer-placeholder-shown:left-4
                  peer-focus:-top-2.5 peer-focus:left-2 peer-focus:text-sm peer-focus:text-indigo-600 
                  bg-white
                  ${touched.brand && !tireData.brand ? 'text-red-500 peer-focus:text-red-500' : 'text-gray-600'}`}
              >
                Brand *
              </label>
              {touched.brand && !tireData.brand && (
                <p className="mt-1 text-xs text-red-500">Brand is required</p>
              )}
            </div>
            
            {/* Model */}
            <div className="relative">
              <input
                id="model"
                name="model"
                type="text"
                value={tireData.model}
                onChange={handleChange}
                className="peer block w-full px-4 py-3 rounded-xl border-2 border-gray-200 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                placeholder="Model"
              />
              <label
                htmlFor="model"
                className="absolute left-2 -top-2.5 px-1 text-sm text-gray-600 transition-all duration-200 
                  peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base peer-placeholder-shown:top-3.5 peer-placeholder-shown:left-4
                  peer-focus:-top-2.5 peer-focus:left-2 peer-focus:text-sm peer-focus:text-indigo-600 
                  bg-white"
              >
                Model
              </label>
            </div>
            
            {/* Size */}
            <div className="relative">
              <input
                id="size"
                name="size"
                type="text"
                value={tireData.size}
                onChange={handleChange}
                className="peer block w-full px-4 py-3 rounded-xl border-2 border-gray-200 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                placeholder="Size"
              />
              <label
                htmlFor="size"
                className="absolute left-2 -top-2.5 px-1 text-sm text-gray-600 transition-all duration-200 
                  peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base peer-placeholder-shown:top-3.5 peer-placeholder-shown:left-4
                  peer-focus:-top-2.5 peer-focus:left-2 peer-focus:text-sm peer-focus:text-indigo-600 
                  bg-white"
              >
                Size
              </label>
            </div>
            
            {/* Date Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Manufacture Date */}
              <div className="relative">
                <input
                  id="manufacture_date"
                  name="manufacture_date"
                  type="date"
                  value={tireData.manufacture_date}
                  onChange={handleChange}
                  className="peer block w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                />
                <label
                  htmlFor="manufacture_date"
                  className="absolute left-2 -top-2.5 px-1 text-sm text-gray-600 bg-white"
                >
                  Manufacture Date
                </label>
              </div>
              
              {/* Purchase Date */}
              <div className="relative">
                <input
                  id="purchase_date"
                  name="purchase_date"
                  type="date"
                  value={tireData.purchase_date}
                  onChange={handleChange}
                  className="peer block w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                />
                <label
                  htmlFor="purchase_date"
                  className="absolute left-2 -top-2.5 px-1 text-sm text-gray-600 bg-white"
                >
                  Purchase Date
                </label>
              </div>
            </div>
            
            {/* Status */}
            <div className="relative">
              <select
                id="status"
                name="status"
                value={tireData.status}
                onChange={handleChange}
                className="block w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white"
              >
                <option value="in-use">In Use</option>
                <option value="spare">Spare</option>
                <option value="retired">Retired</option>
              </select>
              <label
                htmlFor="status"
                className="absolute left-2 -top-2.5 px-1 text-sm text-gray-600 bg-white"
              >
                Status
              </label>
            </div>
            
            {/* Submit button */}
            <div className="mt-8">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-lg transform transition-all duration-200 hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Tire...
                  </>
                ) : (
                  'Create Tire'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Footer note */}
      <p className="mt-6 text-center text-xs text-gray-500">
        Fields marked with * are required
      </p>
    </div>
  );
}

export default CreateTire;