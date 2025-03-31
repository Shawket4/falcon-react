import React, { useState } from 'react';
import { FileText, Languages } from 'lucide-react';

const ExportFuelEventsToPDF = ({ fuelEvents, filters }) => {
  const [language, setLanguage] = useState('english');
  const [isGenerating, setIsGenerating] = useState(false);

  // Column header translations
  const headerTranslations = {
    'Car No Plate': 'رقم السيارة',
    'Driver Name': 'اسم السائق',
    'Date': 'التاريخ',
    'Liters': 'اللترات',
    'Price Per Liter': 'السعر لكل لتر',
    'Price': 'السعر',
    'Fuel Rate': 'معدل الوقود',
    'Transporter': 'الناقل',
    'Odometer Before': 'عداد المسافات قبل',
    'Odometer After': 'عداد المسافات بعد',
    'Distance (km)': 'المسافة (كم)',
    'Fuel Events Report': 'تقرير أحداث الوقود',
    'Summary': 'ملخص',
    'Date Range': 'النطاق الزمني',
    'From': 'من',
    'To': 'إلى',
    'Total': 'المجموع',
    'Average': 'المتوسط',
    'Min': 'الحد الأدنى',
    'Max': 'الحد الأقصى',
    'Fuel Consumption': 'استهلاك الوقود',
    'Total Distance': 'إجمالي المسافة',
    'Total Liters': 'إجمالي اللترات',
    'Average Consumption': 'متوسط ​​الاستهلاك',
    'Liters/100km': 'لتر/100كم',
    'Total Cost': 'التكلفة الإجمالية',
    'Car Analysis': 'تحليل السيارة',
    'Export to PDF': 'تصدير إلى PDF',
    'Generating PDF...': 'جاري إنشاء ملف PDF...',
    'Page': 'صفحة',
    'Fuel Events': 'أحداث الوقود',
    'Car Consumption': 'استهلاك السيارة',
    'Min Consumption': 'الحد الأدنى للاستهلاك',
    'Max Consumption': 'الحد الأقصى للاستهلاك'
  };

  // Translate text based on selected language
  const translate = (text) => {
    if (language === 'arabic' && headerTranslations[text]) {
      return headerTranslations[text];
    }
    return text;
  };

  // Always format numbers in English style
  const formatNumber = (num) => {
    if (num === undefined || num === null) return '0';
    return new Intl.NumberFormat('en-US', { 
      maximumFractionDigits: 2 
    }).format(num);
  };

  // Calculate distance from odometer readings
  const calculateDistance = (before, after) => {
    if (before === null || after === null) return 0;
    return Math.max(0, after - before);
  };

  // Create PDF using print-friendly HTML and browser's print functionality
  const exportToPDF = () => {
    if (!fuelEvents || fuelEvents.length === 0) {
      alert(language === 'arabic' ? 'لا توجد بيانات للتصدير' : 'No data to export');
      return;
    }

    setIsGenerating(true);

    try {
      // Calculate summary statistics
      let totalLiters = 0;
      let totalDistance = 0;
      let totalCost = 0;
      
      fuelEvents.forEach(event => {
        totalLiters += event.liters || 0;
        totalCost += event.price || 0;
        const distance = calculateDistance(event.odometer_before, event.odometer_after);
        totalDistance += distance;
      });
      
      // Calculate average consumption (liters per 100km)
      const avgConsumption = totalDistance > 0 ? (totalLiters / totalDistance) * 100 : 0;
      
      // Group fuel events by car
      const carGroups = {};
      
      fuelEvents.forEach(event => {
        if (!carGroups[event.car_no_plate]) {
          carGroups[event.car_no_plate] = [];
        }
        carGroups[event.car_no_plate].push(event);
      });
      
      // Create a print-friendly window
      const printWindow = window.open('', '_blank');
      const startDate = filters && filters.startDate ? filters.startDate : '';
      const endDate = filters && filters.endDate ? filters.endDate : '';
      
      // Generate HTML content with large, readable text and high contrast
      let htmlContent = `
        <!DOCTYPE html>
        <html lang="${language === 'arabic' ? 'ar' : 'en'}" dir="${language === 'arabic' ? 'rtl' : 'ltr'}">
        <head>
          <meta charset="UTF-8">
          <title>${translate('Fuel Events Report')}</title>
          <style>
            @media print {
              @page {
                size: landscape;
                margin: 0.5cm;
              }
              body {
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
              }
              .page-break {
                page-break-before: always;
              }
            }
            
            body {
              font-family: Arial, sans-serif;
              font-size: 14pt;
              line-height: 1.3;
              color: #333;
              margin: 15px;
              background-color: white;
              direction: ${language === 'arabic' ? 'rtl' : 'ltr'};
            }
            
            h1 {
              text-align: center;
              color: white;
              background-color: #3B82F6;
              padding: 15px;
              margin: 0 0 10px 0;
              font-size: 24pt;
              font-weight: bold;
            }
            
            .date-range {
              text-align: center;
              margin: 10px 0 20px;
              font-size: 16pt;
              font-weight: bold;
            }
            
            h2 {
              color: #3B82F6;
              background-color: #E5E7EB;
              padding: 10px;
              margin: 20px 0 10px 0;
              font-size: 20pt;
              font-weight: bold;
              border-top: 2px solid #D1D5DB;
              border-bottom: 2px solid #D1D5DB;
            }
            
            h3 {
              background-color: #10B981;
              color: white;
              padding: 10px;
              margin: 30px 0 10px 0;
              font-size: 18pt;
              font-weight: bold;
              border-top: 2px solid #D1D5DB;
              border-bottom: 2px solid #D1D5DB;
            }
            
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
              font-size: 14pt;
            }
            
            th {
              background-color: #3B82F6;
              color: white;
              font-weight: bold;
              padding: 12px 8px;
              text-align: center;
              border: 2px solid #D1D5DB;
            }
            
            .car-table th {
              background-color: #10B981;
            }
            
            td {
              padding: 10px 8px;
              border: 2px solid #D1D5DB;
              text-align: center;
              font-weight: bold;
            }
            
            td.text-cell {
              text-align: ${language === 'arabic' ? 'right' : 'left'};
            }
            
            tr:nth-child(even) {
              background-color: #F9FAFB;
            }
            
            .total-row {
              background-color: #F3F4F6;
              font-weight: bolder;
            }
            
            .summary-section, .car-section {
              position: relative;
              padding-bottom: 40px;
            }
            
            .page-number {
              position: absolute;
              bottom: 20px;
              ${language === 'arabic' ? 'left' : 'right'}: 20px;
              font-size: 12pt;
              color: #666;
            }
          </style>
        </head>
        <body>
      `;
      
      // SUMMARY SECTION
      htmlContent += `
        <div class="summary-section">
          <h1>${translate('Fuel Events Report')}</h1>
          
          <div class="date-range">
            ${translate('Date Range')}: ${translate('From')} ${startDate} ${translate('To')} ${endDate}
          </div>
          
          <h2>${translate('Fuel Consumption')}</h2>
          
          <table>
            <thead>
              <tr>
                <th>${translate('Total Distance')}</th>
                <th>${translate('Total Liters')}</th>
                <th>${translate('Average Consumption')}</th>
                <th>${translate('Total Cost')}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${formatNumber(totalDistance)} ${translate('km')}</td>
                <td>${formatNumber(totalLiters)} L</td>
                <td>${formatNumber(avgConsumption)} ${translate('Liters/100km')}</td>
                <td>${formatNumber(totalCost)}</td>
              </tr>
            </tbody>
          </table>
          
          <h2>${translate('Fuel Events')}</h2>
          
          <table>
            <thead>
              <tr>
                <th>${translate('Car No Plate')}</th>
                <th>${translate('Driver Name')}</th>
                <th>${translate('Date')}</th>
                <th>${translate('Liters')}</th>
                <th>${translate('Price Per Liter')}</th>
                <th>${translate('Price')}</th>
                <th>${translate('Fuel Rate')}</th>
                <th>${translate('Transporter')}</th>
                <th>${translate('Odometer Before')}</th>
                <th>${translate('Odometer After')}</th>
                <th>${translate('Distance (km)')}</th>
              </tr>
            </thead>
            <tbody>
      `;
      
      // Add all fuel events to summary table
      fuelEvents.forEach(event => {
        const distance = calculateDistance(event.odometer_before, event.odometer_after);
        
        htmlContent += `
          <tr>
            <td class="text-cell">${event.car_no_plate}</td>
            <td class="text-cell">${event.driver_name}</td>
            <td>${event.date}</td>
            <td>${formatNumber(event.liters)}</td>
            <td>${formatNumber(event.price_per_liter)}</td>
            <td>${formatNumber(event.price)}</td>
            <td>${formatNumber(event.fuel_rate)}</td>
            <td class="text-cell">${event.transporter}</td>
            <td>${formatNumber(event.odometer_before)}</td>
            <td>${formatNumber(event.odometer_after)}</td>
            <td>${formatNumber(distance)}</td>
          </tr>
        `;
      });
      
      // Add total row to summary table
      htmlContent += `
              <tr class="total-row">
                <td class="text-cell">${translate('Total')}</td>
                <td></td>
                <td></td>
                <td>${formatNumber(totalLiters)}</td>
                <td></td>
                <td>${formatNumber(totalCost)}</td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td>${formatNumber(totalDistance)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      `;
      
      // CAR DETAIL SECTIONS - One page per car
      Object.keys(carGroups).forEach(carPlate => {
        const carEvents = carGroups[carPlate];
        
        // Calculate car-specific statistics
        let carTotalLiters = 0;
        let carTotalDistance = 0;
        let carTotalCost = 0;
        let minConsumption = Infinity;
        let maxConsumption = 0;
        
        carEvents.forEach(event => {
          carTotalLiters += event.liters || 0;
          carTotalCost += event.price || 0;
          const distance = calculateDistance(event.odometer_before, event.odometer_after);
          carTotalDistance += distance;
          
          // Calculate consumption for this event
          if (distance > 0 && event.liters > 0) {
            const consumption = (event.liters / distance) * 100;
            minConsumption = Math.min(minConsumption, consumption);
            maxConsumption = Math.max(maxConsumption, consumption);
          }
        });
        
        // Handle case where no valid consumption values were found
        if (minConsumption === Infinity) minConsumption = 0;
        
        // Calculate average consumption for car
        const carAvgConsumption = carTotalDistance > 0 ? (carTotalLiters / carTotalDistance) * 100 : 0;
        
        htmlContent += `
          <div class="page-break car-section">
            <h1>${translate('Car Analysis')}: ${carPlate}</h1>
            
            <div class="date-range">
              ${translate('Date Range')}: ${translate('From')} ${startDate} ${translate('To')} ${endDate}
            </div>
            
            <h2>${translate('Car Consumption')}</h2>
            
            <table>
              <thead>
                <tr>
                  <th>${translate('Total Distance')}</th>
                  <th>${translate('Total Liters')}</th>
                  <th>${translate('Average Consumption')}</th>
                  <th>${translate('Min Consumption')}</th>
                  <th>${translate('Max Consumption')}</th>
                  <th>${translate('Total Cost')}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>${formatNumber(carTotalDistance)} ${translate('km')}</td>
                  <td>${formatNumber(carTotalLiters)} L</td>
                  <td>${formatNumber(carAvgConsumption)} ${translate('Liters/100km')}</td>
                  <td>${formatNumber(minConsumption)} ${translate('Liters/100km')}</td>
                  <td>${formatNumber(maxConsumption)} ${translate('Liters/100km')}</td>
                  <td>${formatNumber(carTotalCost)}</td>
                </tr>
              </tbody>
            </table>
            
            <h2>${translate('Fuel Events')}</h2>
            
            <table class="car-table">
              <thead>
                <tr>
                  <th>${translate('Car No Plate')}</th>
                  <th>${translate('Driver Name')}</th>
                  <th>${translate('Date')}</th>
                  <th>${translate('Liters')}</th>
                  <th>${translate('Price Per Liter')}</th>
                  <th>${translate('Price')}</th>
                  <th>${translate('Fuel Rate')}</th>
                  <th>${translate('Transporter')}</th>
                  <th>${translate('Odometer Before')}</th>
                  <th>${translate('Odometer After')}</th>
                  <th>${translate('Distance (km)')}</th>
                </tr>
              </thead>
              <tbody>
        `;
        
        // Add car-specific events
        carEvents.forEach(event => {
          const distance = calculateDistance(event.odometer_before, event.odometer_after);
          
          htmlContent += `
            <tr>
              <td class="text-cell">${event.car_no_plate}</td>
              <td class="text-cell">${event.driver_name}</td>
              <td>${event.date}</td>
              <td>${formatNumber(event.liters)}</td>
              <td>${formatNumber(event.price_per_liter)}</td>
              <td>${formatNumber(event.price)}</td>
              <td>${formatNumber(event.fuel_rate)}</td>
              <td class="text-cell">${event.transporter}</td>
              <td>${formatNumber(event.odometer_before)}</td>
              <td>${formatNumber(event.odometer_after)}</td>
              <td>${formatNumber(distance)}</td>
            </tr>
          `;
        });
        
        // Add car-specific total row
        htmlContent += `
                <tr class="total-row">
                  <td class="text-cell">${translate('Total')}</td>
                  <td></td>
                  <td></td>
                  <td>${formatNumber(carTotalLiters)}</td>
                  <td></td>
                  <td>${formatNumber(carTotalCost)}</td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td>${formatNumber(carTotalDistance)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        `;
      });
      
      // Close HTML and add page numbering script
      htmlContent += `
        <script>
          // Add page numbers
          let addPageNumbers = function() {
            // Get all the pages
            var pages = document.querySelectorAll('.summary-section, .car-section');
            
            // Add page number containers to each page
            pages.forEach(function(page, index) {
              var pageNumberDiv = document.createElement('div');
              pageNumberDiv.className = 'page-number';
              pageNumberDiv.textContent = (index + 1) + ' / ' + pages.length;
              page.appendChild(pageNumberDiv);
            });
          };
          
          // Auto print and close when done
          window.onload = function() {
            // Add page numbers first
            addPageNumbers();
            
            // Allow time for rendering and fonts to load
            setTimeout(function() {
              window.print();
              
              // Listen for when print is done or canceled
              window.addEventListener('afterprint', function() {
                // Don't close immediately to allow save as PDF
                // window.close();
              });
            }, 1000);
          }
        </script>
      </body>
      </html>
      `;
      
      // Write HTML to new window
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('An error occurred: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="mb-4 flex items-center gap-4">
      <div className="border border-gray-300 rounded-md p-2">
        <div className="flex items-center space-x-2">
          <Languages className="h-5 w-5 text-gray-500" />
          <select
            className="outline-none bg-transparent"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            dir={language === 'arabic' ? 'rtl' : 'ltr'}
          >
            <option value="english">English</option>
            <option value="arabic">العربية</option>
          </select>
        </div>
      </div>
      
      <button
        onClick={exportToPDF}
        disabled={isGenerating}
        className={`flex items-center px-4 py-2 ${isGenerating ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'} text-white rounded-md transition-colors`}
        dir={language === 'arabic' ? 'rtl' : 'ltr'}
      >
        <FileText className="h-5 w-5" />
        <span className={language === 'arabic' ? 'mr-2' : 'ml-2'}>
          {isGenerating ? translate('Generating PDF...') : translate('Export to PDF')}
        </span>
      </button>
    </div>
  );
};

export default ExportFuelEventsToPDF;