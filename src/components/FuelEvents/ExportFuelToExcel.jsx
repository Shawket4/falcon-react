import React, { useState } from 'react';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { Download, Languages } from 'lucide-react';

const ExportFuelEventsToExcel = ({ fuelEvents, filters }) => {
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
    'Export to Excel': 'تصدير إلى Excel',
    'Generating Excel...': 'جاري إنشاء ملف Excel...',
    'Page': 'صفحة'
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

  const exportToExcel = async () => {
    if (!fuelEvents || fuelEvents.length === 0) {
      alert(language === 'arabic' ? 'لا توجد بيانات للتصدير' : 'No data to export');
      return;
    }

    setIsGenerating(true);

    try {
      // Create a new workbook
      const workbook = new ExcelJS.Workbook();
      
      // Set RTL direction if in Arabic
      if (language === 'arabic') {
        workbook.views = [
          {
            x: 0, y: 0, width: 10000, height: 20000,
            firstSheet: 0, activeTab: 0, visibility: 'visible',
            rightToLeft: true
          }
        ];
      }
      
      // ====== SUMMARY SHEET - Create on its own sheet ======
      const summarySheet = workbook.addWorksheet(translate('Summary'), {
        views: [{ rightToLeft: language === 'arabic' }],
        pageSetup: {
          paperSize: 9, // A4
          orientation: 'landscape',
          fitToPage: true,
          fitToWidth: 1,
          fitToHeight: 0,
          margins: {
            left: 0.5, right: 0.5,
            top: 0.5, bottom: 0.5,
            header: 0.3, footer: 0.3
          }
        }
      });
      
      // Define enhanced styles with larger text and bold formatting
      const reportTitleStyle = {
        font: { bold: true, size: 22, color: { argb: 'FFFFFF' } },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '3B82F6' } },
        alignment: { 
          horizontal: language === 'arabic' ? 'right' : 'left', 
          vertical: 'middle'
        },
        border: {
          bottom: { style: 'medium', color: { argb: 'D1D5DB' } }
        }
      };
      
      const sectionTitleStyle = {
        font: { bold: true, size: 18 },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E5E7EB' } },
        alignment: { 
          horizontal: language === 'arabic' ? 'right' : 'left', 
          vertical: 'middle'
        },
        border: {
          top: { style: 'medium', color: { argb: 'D1D5DB' } },
          bottom: { style: 'medium', color: { argb: 'D1D5DB' } }
        }
      };
      
      const dateHeaderStyle = {
        font: { bold: true, italic: true, size: 14, color: { argb: '4B5563' } },
        alignment: { 
          horizontal: language === 'arabic' ? 'right' : 'left', 
          vertical: 'middle'
        }
      };
      
      const dateValueStyle = {
        font: { size: 14, color: { argb: '4B5563' }, bold: true },
        alignment: { 
          horizontal: 'center', 
          vertical: 'middle'
        }
      };
      
      const tableHeaderStyle = {
        font: { bold: true, size: 16, color: { argb: 'FFFFFF' } },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '3B82F6' } },
        alignment: { 
          horizontal: 'center', 
          vertical: 'middle',
          wrapText: true
        },
        border: {
          top: { style: 'medium', color: { argb: 'D1D5DB' } },
          bottom: { style: 'medium', color: { argb: 'D1D5DB' } },
          left: { style: 'medium', color: { argb: 'D1D5DB' } },
          right: { style: 'medium', color: { argb: 'D1D5DB' } }
        }
      };
      
      const cellStyle = {
        font: { bold: true, size: 14 },
        alignment: { 
          horizontal: 'center', 
          vertical: 'middle',
          wrapText: true
        },
        border: {
          top: { style: 'medium', color: { argb: 'D1D5DB' } },
          bottom: { style: 'medium', color: { argb: 'D1D5DB' } },
          left: { style: 'medium', color: { argb: 'D1D5DB' } },
          right: { style: 'medium', color: { argb: 'D1D5DB' } }
        }
      };
      
      const textCellStyle = {
        font: { bold: true, size: 14 },
        alignment: { 
          horizontal: language === 'arabic' ? 'right' : 'left', 
          vertical: 'middle'
        },
        border: {
          top: { style: 'medium', color: { argb: 'D1D5DB' } },
          bottom: { style: 'medium', color: { argb: 'D1D5DB' } },
          left: { style: 'medium', color: { argb: 'D1D5DB' } },
          right: { style: 'medium', color: { argb: 'D1D5DB' } }
        }
      };
      
      const totalRowStyle = {
        font: { bold: true, size: 16 },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F3F4F6' } },
        alignment: { 
          horizontal: 'center', 
          vertical: 'middle'
        },
        border: {
          top: { style: 'medium', color: { argb: 'D1D5DB' } },
          bottom: { style: 'medium', color: { argb: 'D1D5DB' } },
          left: { style: 'medium', color: { argb: 'D1D5DB' } },
          right: { style: 'medium', color: { argb: 'D1D5DB' } }
        }
      };
      
      const totalLabelStyle = {
        font: { bold: true, size: 16 },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F3F4F6' } },
        alignment: { 
          horizontal: language === 'arabic' ? 'right' : 'left', 
          vertical: 'middle'
        },
        border: {
          top: { style: 'medium', color: { argb: 'D1D5DB' } },
          bottom: { style: 'medium', color: { argb: 'D1D5DB' } },
          left: { style: 'medium', color: { argb: 'D1D5DB' } },
          right: { style: 'medium', color: { argb: 'D1D5DB' } }
        }
      };
      
      // Set column widths for better readability
      const columnWidths = [
        { width: 20 }, // Car No Plate
        { width: 25 }, // Driver Name
        { width: 15 }, // Date
        { width: 15 }, // Liters
        { width: 15 }, // Price Per Liter
        { width: 15 }, // Price
        { width: 15 }, // Fuel Rate
        { width: 20 }, // Transporter
        { width: 15 }, // Odometer Before
        { width: 15 }, // Odometer After
        { width: 15 }  // Distance
      ];
      
      // Apply column widths
      summarySheet.columns = columnWidths;
      
      // Add report title
      const titleRow = summarySheet.addRow([translate('Fuel Events Report')]);
      titleRow.height = 40;
      const titleCell = titleRow.getCell(1);
      titleCell.style = reportTitleStyle;
      summarySheet.mergeCells('A1:K1');
      
      // Add empty row
      summarySheet.addRow([]);
      
      // Add date range
      const startDate = filters && filters.startDate ? filters.startDate : '';
      const endDate = filters && filters.endDate ? filters.endDate : '';
      
      const dateHeaderRow = summarySheet.addRow([translate('Date Range'), translate('From'), translate('To')]);
      dateHeaderRow.height = 30;
      for (let i = 1; i <= 3; i++) {
        dateHeaderRow.getCell(i).style = dateHeaderStyle;
      }
      
      const dateValueRow = summarySheet.addRow(['', startDate, endDate]);
      dateValueRow.height = 30;
      for (let i = 2; i <= 3; i++) {
        dateValueRow.getCell(i).style = dateValueStyle;
      }
      
      // Add empty row
      summarySheet.addRow([]);
      
      // Add fuel consumption summary
      const consumptionTitleRow = summarySheet.addRow([translate('Fuel Consumption')]);
      consumptionTitleRow.height = 35;
      consumptionTitleRow.getCell(1).style = sectionTitleStyle;
      summarySheet.mergeCells('A6:K6');
      
      // Calculate fuel consumption totals
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
      
      // Add consumption summary
      const consumptionHeaders = [
        translate('Total Distance'),
        translate('Total Liters'),
        translate('Average Consumption'),
        translate('Total Cost')
      ];
      
      const consumptionHeaderRow = summarySheet.addRow(consumptionHeaders);
      consumptionHeaderRow.height = 35;
      for (let i = 1; i <= consumptionHeaders.length; i++) {
        consumptionHeaderRow.getCell(i).style = tableHeaderStyle;
      }
      
      const consumptionDataRow = summarySheet.addRow([
        `${formatNumber(totalDistance)} ${translate('km')}`,
        `${formatNumber(totalLiters)} L`,
        `${formatNumber(avgConsumption)} ${translate('Liters/100km')}`,
        `${formatNumber(totalCost)}`
      ]);
      consumptionDataRow.height = 30;
      for (let i = 1; i <= 4; i++) {
        consumptionDataRow.getCell(i).style = cellStyle;
      }
      
      // Add empty rows
      summarySheet.addRow([]);
      summarySheet.addRow([]);
      
      // Add list of all fuel events
      const eventsTitleRow = summarySheet.addRow([translate('Fuel Events')]);
      eventsTitleRow.height = 35;
      eventsTitleRow.getCell(1).style = sectionTitleStyle;
      summarySheet.mergeCells('A11:K11');
      
      // Add event headers
      const eventHeaders = [
        translate('Car No Plate'),
        translate('Driver Name'),
        translate('Date'),
        translate('Liters'),
        translate('Price Per Liter'),
        translate('Price'),
        translate('Fuel Rate'),
        translate('Transporter'),
        translate('Odometer Before'),
        translate('Odometer After'),
        translate('Distance (km)')
      ];
      
      const eventHeaderRow = summarySheet.addRow(eventHeaders);
      eventHeaderRow.height = 35;
      for (let i = 1; i <= eventHeaders.length; i++) {
        eventHeaderRow.getCell(i).style = tableHeaderStyle;
      }
      
      // Add event data rows
      fuelEvents.forEach((event, index) => {
        const distance = calculateDistance(event.odometer_before, event.odometer_after);
        
        const eventRow = summarySheet.addRow([
          event.car_no_plate,
          event.driver_name,
          event.date,
          event.liters,
          event.price_per_liter,
          event.price,
          event.fuel_rate,
          event.transporter,
          event.odometer_before,
          event.odometer_after,
          distance
        ]);
        
        eventRow.height = 30;
        
        // Style the text cells
        eventRow.getCell(1).style = textCellStyle; // Car No Plate
        eventRow.getCell(2).style = textCellStyle; // Driver Name
        eventRow.getCell(8).style = textCellStyle; // Transporter
        
        // Style the numeric cells
        for (let i = 3; i <= 11; i++) {
          if (i !== 8) { // All except Transporter
            const cell = eventRow.getCell(i);
            cell.style = cellStyle;
            
            // Format date
            if (i === 3) { // Date
              // No special formatting needed for date as it's already a string
            } 
            // Format numbers
            else {
              cell.numFmt = '#,##0.00';
            }
          }
        }
        
        // Add alternating row colors
        if (index % 2 === 1) {
          for (let i = 1; i <= 11; i++) {
            eventRow.getCell(i).fill = { 
              type: 'pattern', 
              pattern: 'solid', 
              fgColor: { argb: 'F9FAFB' } 
            };
          }
        }
      });
      
      // Add totals row
      const totalRow = summarySheet.addRow([
        translate('Total'),
        '', // Driver Name
        '', // Date
        totalLiters, // Liters
        '', // Price Per Liter
        totalCost, // Price
        '', // Fuel Rate
        '', // Transporter
        '', // Odometer Before
        '', // Odometer After
        totalDistance // Distance
      ]);
      
      totalRow.height = 35;
      totalRow.getCell(1).style = totalLabelStyle;
      
      // Style the totals
      totalRow.getCell(4).style = totalRowStyle; // Liters
      totalRow.getCell(4).numFmt = '#,##0.00';
      
      totalRow.getCell(6).style = totalRowStyle; // Price
      totalRow.getCell(6).numFmt = '#,##0.00';
      
      totalRow.getCell(11).style = totalRowStyle; // Distance
      totalRow.getCell(11).numFmt = '#,##0.00';
      
      // Add footer with page number
      summarySheet.headerFooter.oddFooter = "&C&B" + translate('Page') + " 1";
      
      // ====== CAR ANALYSIS SHEET - One sheet per car ======
      // Group fuel events by car
      const carGroups = {};
      
      fuelEvents.forEach(event => {
        if (!carGroups[event.car_no_plate]) {
          carGroups[event.car_no_plate] = [];
        }
        carGroups[event.car_no_plate].push(event);
      });
      
      // Create a sheet for each car with its own analysis
      Object.keys(carGroups).forEach((carPlate, carIndex) => {
        const carEvents = carGroups[carPlate];
        
        // Create a new worksheet for each car
        const carSheet = workbook.addWorksheet(carPlate, {
          views: [{ rightToLeft: language === 'arabic' }],
          pageSetup: {
            paperSize: 9, // A4
            orientation: 'landscape',
            fitToPage: true,
            fitToWidth: 1,
            fitToHeight: 0,
            margins: {
              left: 0.5, right: 0.5,
              top: 0.5, bottom: 0.5,
              header: 0.3, footer: 0.3
            }
          }
        });
        
        // Apply column widths to car sheet
        carSheet.columns = columnWidths;
        
        // Add car title
        const carTitleRow = carSheet.addRow([`${translate('Car Analysis')}: ${carPlate}`]);
        carTitleRow.height = 40;
        carTitleRow.getCell(1).style = reportTitleStyle;
        carSheet.mergeCells('A1:K1');
        
        // Add date range to car sheet
        carSheet.addRow([]);
        const carDateHeaderRow = carSheet.addRow([translate('Date Range'), translate('From'), translate('To')]);
        carDateHeaderRow.height = 30;
        for (let i = 1; i <= 3; i++) {
          carDateHeaderRow.getCell(i).style = dateHeaderStyle;
        }
        
        const carDateValueRow = carSheet.addRow(['', startDate, endDate]);
        carDateValueRow.height = 30;
        for (let i = 2; i <= 3; i++) {
          carDateValueRow.getCell(i).style = dateValueStyle;
        }
        
        carSheet.addRow([]);
        
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
        
        // Add car consumption summary
        const carConsumptionTitleRow = carSheet.addRow([translate('Car Consumption')]);
        carConsumptionTitleRow.height = 35;
        carConsumptionTitleRow.getCell(1).style = sectionTitleStyle;
        carSheet.mergeCells('A6:K6');
        
        // Add consumption summary headers
        const carConsumptionHeaders = [
          translate('Total Distance'),
          translate('Total Liters'),
          translate('Average Consumption'),
          translate('Min Consumption'),
          translate('Max Consumption'),
          translate('Total Cost')
        ];
        
        const carConsumptionHeaderRow = carSheet.addRow(carConsumptionHeaders);
        carConsumptionHeaderRow.height = 35;
        for (let i = 1; i <= carConsumptionHeaders.length; i++) {
          carConsumptionHeaderRow.getCell(i).style = tableHeaderStyle;
        }
        
        const carConsumptionDataRow = carSheet.addRow([
          `${formatNumber(carTotalDistance)} ${translate('km')}`,
          `${formatNumber(carTotalLiters)} L`,
          `${formatNumber(carAvgConsumption)} ${translate('Liters/100km')}`,
          `${formatNumber(minConsumption)} ${translate('Liters/100km')}`,
          `${formatNumber(maxConsumption)} ${translate('Liters/100km')}`,
          `${formatNumber(carTotalCost)}`
        ]);
        carConsumptionDataRow.height = 30;
        for (let i = 1; i <= 6; i++) {
          carConsumptionDataRow.getCell(i).style = cellStyle;
        }
        
        // Add empty rows
        carSheet.addRow([]);
        carSheet.addRow([]);
        
        // Add car event details
        const carEventsTitleRow = carSheet.addRow([translate('Fuel Events')]);
        carEventsTitleRow.height = 35;
        carEventsTitleRow.getCell(1).style = sectionTitleStyle;
        carSheet.mergeCells('A10:K10');
        
        // Add event headers
        const carEventHeaders = [
          translate('Car No Plate'),
          translate('Driver Name'),
          translate('Date'),
          translate('Liters'),
          translate('Price Per Liter'),
          translate('Price'),
          translate('Fuel Rate'),
          translate('Transporter'),
          translate('Odometer Before'),
          translate('Odometer After'),
          translate('Distance (km)')
        ];
        
        const carEventHeaderRow = carSheet.addRow(carEventHeaders);
        carEventHeaderRow.height = 35;
        for (let i = 1; i <= carEventHeaders.length; i++) {
          carEventHeaderRow.getCell(i).style = tableHeaderStyle;
        }
        
        // Add event data rows
        carEvents.forEach((event, index) => {
          const distance = calculateDistance(event.odometer_before, event.odometer_after);
          
          const eventRow = carSheet.addRow([
            event.car_no_plate,
            event.driver_name,
            event.date,
            event.liters,
            event.price_per_liter,
            event.price,
            event.fuel_rate,
            event.transporter,
            event.odometer_before,
            event.odometer_after,
            distance
          ]);
          
          eventRow.height = 30;
          
          // Style the text cells
          eventRow.getCell(1).style = textCellStyle; // Car No Plate
          eventRow.getCell(2).style = textCellStyle; // Driver Name
          eventRow.getCell(8).style = textCellStyle; // Transporter
          
          // Style the numeric cells
          for (let i = 3; i <= 11; i++) {
            if (i !== 8) { // All except Transporter
              const cell = eventRow.getCell(i);
              cell.style = cellStyle;
              
              // Format date
              if (i === 3) { // Date
                // No special formatting needed for date as it's already a string
              } 
              // Format numbers
              else {
                cell.numFmt = '#,##0.00';
              }
            }
          }
          
          // Add alternating row colors
          if (index % 2 === 1) {
            for (let i = 1; i <= 11; i++) {
              eventRow.getCell(i).fill = { 
                type: 'pattern', 
                pattern: 'solid', 
                fgColor: { argb: 'F9FAFB' } 
              };
            }
          }
        });
        
        // Add car totals row
        const carTotalRow = carSheet.addRow([
          translate('Total'),
          '', // Driver Name
          '', // Date
          carTotalLiters, // Liters
          '', // Price Per Liter
          carTotalCost, // Price
          '', // Fuel Rate
          '', // Transporter
          '', // Odometer Before
          '', // Odometer After
          carTotalDistance // Distance
        ]);
        
        carTotalRow.height = 35;
        carTotalRow.getCell(1).style = totalLabelStyle;
        
        // Style the totals
        carTotalRow.getCell(4).style = totalRowStyle; // Liters
        carTotalRow.getCell(4).numFmt = '#,##0.00';
        
        carTotalRow.getCell(6).style = totalRowStyle; // Price
        carTotalRow.getCell(6).numFmt = '#,##0.00';
        
        carTotalRow.getCell(11).style = totalRowStyle; // Distance
        carTotalRow.getCell(11).numFmt = '#,##0.00';
        
        // Add page number in footer
        carSheet.headerFooter.oddFooter = "&C&B" + translate('Page') + " " + (carIndex + 2);
      });
      
      // Generate Excel file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      // Create filename
      const fileName = language === 'arabic' ? 'تقرير_الوقود.xlsx' : 'Fuel_Report.xlsx';
      
      // Save file
      saveAs(blob, fileName);
      
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert(
        language === 'arabic' 
          ? 'حدث خطأ أثناء التصدير إلى Excel' 
          : 'An error occurred during Excel export'
      );
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
        onClick={exportToExcel}
        disabled={isGenerating}
        className={`flex items-center px-4 py-2 ${isGenerating ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-md transition-colors`}
        dir={language === 'arabic' ? 'rtl' : 'ltr'}
      >
        <Download className="h-5 w-5" />
        <span className={language === 'arabic' ? 'mr-2' : 'ml-2'}>
          {isGenerating ? translate('Generating Excel...') : translate('Export to Excel')}
        </span>
      </button>
    </div>
  );
};

export default ExportFuelEventsToExcel;