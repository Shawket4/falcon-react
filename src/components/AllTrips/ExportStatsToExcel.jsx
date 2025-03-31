import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Download, Languages } from 'lucide-react';

const ExportToExcel = ({ statistics, hasFinancialAccess, filters }) => {
  const [language, setLanguage] = useState('english'); // Default language is English

  // Company name translations
  const companyTranslations = {
    'Petrol Arrows': 'السهام البترولية',
    'TAQA': 'طاقة',
    'Watanya': 'وطنية'
  };

  // Column header translations
  const headerTranslations = {
    'Company': 'الشركة',
    'Group': 'المجموعة',
    'Trips': 'الرحلات',
    'Volume (L)': 'الحجم (لتر)',
    'Distance (km)': 'المسافة (كم)',
    'Base Revenue': 'الإيرادات الأساسية',
    'VAT (14%)': 'ضريبة القيمة المضافة (14٪)',
    'Car Rental Fees': 'رسوم تأجير السيارات',
    'Total Amount': 'المبلغ الإجمالي',
    'Fee': 'الرسوم',
    'Cars': 'السيارات',
    'Days': 'الأيام',
    'Total': 'المجموع',
    'Date Range': 'النطاق الزمني',
    'From': 'من',
    'To': 'إلى',
    'Statistics Report': 'تقرير الإحصائيات'
  };

  // Translate text based on selected language
  const translate = (text) => {
    if (language === 'arabic' && headerTranslations[text]) {
      return headerTranslations[text];
    }
    return text;
  };

  // Translate company name based on selected language
  const translateCompanyName = (name) => {
    if (language === 'arabic' && companyTranslations[name]) {
      return companyTranslations[name];
    }
    return name;
  };

  // Always format numbers in English style
  const formatNumber = (num) => {
    if (num === undefined || num === null) return '0';
    return new Intl.NumberFormat('en-US', { 
      maximumFractionDigits: 2 
    }).format(num);
  };

  // Format as currency
  const formatCurrency = (num) => {
    if (num === undefined || num === null) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  };

  // Apply cell styles to a range
  const applyCellStyle = (ws, range, style) => {
    const [startCell, endCell] = range.split(':');
    const startCol = startCell.replace(/[0-9]/g, '');
    const startRow = parseInt(startCell.replace(/[A-Z]/g, ''));
    const endCol = endCell.replace(/[0-9]/g, '');
    const endRow = parseInt(endCell.replace(/[A-Z]/g, ''));
    
    // Convert column letters to indices
    const startColIndex = XLSX.utils.decode_col(startCol);
    const endColIndex = XLSX.utils.decode_col(endCol);
    
    // Apply styles to each cell in the range
    for (let row = startRow; row <= endRow; row++) {
      for (let col = startColIndex; col <= endColIndex; col++) {
        const cellRef = XLSX.utils.encode_cell({ r: row - 1, c: col });
        if (!ws[cellRef]) ws[cellRef] = { t: 's', v: '' };
        ws[cellRef].s = style;
      }
    }
  };

  const exportToExcel = () => {
    if (!statistics || statistics.length === 0) {
      alert(language === 'arabic' ? 'لا توجد بيانات للتصدير' : 'No data to export');
      return;
    }

    try {
      // Create workbook
      const wb = XLSX.utils.book_new();
      
      // Styles
      const titleStyle = {
        font: { bold: true, sz: 16, color: { rgb: "000000" } },
        fill: { fgColor: { rgb: "EFEFEF" } },
        alignment: { 
          horizontal: language === 'arabic' ? 'right' : 'left', 
          vertical: 'center'
        }
      };
      
      const headerStyle = {
        font: { bold: true, sz: 12, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "3B82F6" } },
        alignment: { 
          horizontal: language === 'arabic' ? 'right' : 'center', 
          vertical: 'center'
        },
        border: {
          top: { style: 'thin', color: { rgb: "000000" } },
          bottom: { style: 'thin', color: { rgb: "000000" } },
          left: { style: 'thin', color: { rgb: "000000" } },
          right: { style: 'thin', color: { rgb: "000000" } }
        }
      };
      
      const subHeaderStyle = {
        font: { bold: true, sz: 11, color: { rgb: "000000" } },
        fill: { fgColor: { rgb: "E5E7EB" } },
        alignment: { 
          horizontal: language === 'arabic' ? 'right' : 'left', 
          vertical: 'center'
        }
      };
      
      const cellStyle = {
        alignment: { 
          horizontal: 'center', 
          vertical: 'center'
        },
        border: {
          top: { style: 'thin', color: { rgb: "D1D5DB" } },
          bottom: { style: 'thin', color: { rgb: "D1D5DB" } },
          left: { style: 'thin', color: { rgb: "D1D5DB" } },
          right: { style: 'thin', color: { rgb: "D1D5DB" } }
        }
      };
      
      const numberCellStyle = {
        ...cellStyle,
        numFmt: '#,##0.00'
      };
      
      const currencyCellStyle = {
        ...cellStyle,
        numFmt: '$#,##0.00'
      };
      
      const totalRowStyle = {
        font: { bold: true },
        fill: { fgColor: { rgb: "F3F4F6" } },
        alignment: { 
          horizontal: 'center', 
          vertical: 'center'
        },
        border: {
          top: { style: 'thin', color: { rgb: "000000" } },
          bottom: { style: 'thin', color: { rgb: "000000" } },
          left: { style: 'thin', color: { rgb: "000000" } },
          right: { style: 'thin', color: { rgb: "000000" } }
        }
      };

      // Get date range for report header
      const dateRange = filters ? 
        `${filters.startDate || ''} to ${filters.endDate || ''}` : 
        new Date().toLocaleDateString();
      
      // Create summary sheet
      const summaryData = [];
      
      // Add title and date range
      summaryData.push([translate('Statistics Report')]);
      summaryData.push([translate('Date Range'), translate('From'), translate('To')]);
      summaryData.push(['', filters?.startDate || '', filters?.endDate || '']);
      summaryData.push([]); // Empty row

      // Calculate totals for summary
      const totals = statistics.reduce((acc, company) => {
        acc.totalTrips += (company.total_trips || 0);
        acc.totalVolume += (company.total_volume || 0);
        acc.totalDistance += (company.total_distance || 0);
        acc.totalRevenue += (company.total_revenue || 0);
        acc.totalVAT += (company.total_vat || 0);
        acc.totalCarRent += (company.total_car_rent || 0);
        return acc;
      }, { 
        totalTrips: 0, 
        totalVolume: 0, 
        totalDistance: 0, 
        totalRevenue: 0,
        totalVAT: 0,
        totalCarRent: 0
      });
      
      totals.totalAmount = totals.totalRevenue + totals.totalVAT + totals.totalCarRent;
      
      // Headers for summary
      const summaryHeaders = [
        translate('Company'), 
        translate('Trips'), 
        translate('Volume (L)'), 
        translate('Distance (km)')
      ];
      
      if (hasFinancialAccess) {
        summaryHeaders.push(
          translate('Base Revenue'),
          translate('VAT (14%)'),
          translate('Car Rental Fees'),
          translate('Total Amount')
        );
      }
      
      summaryData.push(summaryHeaders);
      
      // Add summary data for each company
      statistics.forEach(company => {
        const row = [
          translateCompanyName(company.company),
          company.total_trips || 0,
          company.total_volume || 0,
          company.total_distance || 0
        ];
        
        if (hasFinancialAccess) {
          row.push(
            company.total_revenue || 0,
            company.total_vat || 0,
            company.total_car_rent || 0,
            (company.total_revenue || 0) + (company.total_vat || 0) + (company.total_car_rent || 0)
          );
        }
        
        summaryData.push(row);
      });
      
      // Add totals row
      const totalsRow = [
        translate('Total'),
        totals.totalTrips,
        totals.totalVolume,
        totals.totalDistance
      ];
      
      if (hasFinancialAccess) {
        totalsRow.push(
          totals.totalRevenue,
          totals.totalVAT,
          totals.totalCarRent,
          totals.totalAmount
        );
      }
      
      summaryData.push(totalsRow);
      
      // Create summary worksheet
      const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
      
      // Set column widths
      const summaryColWidths = [
        { wch: 20 }, // Company name
        { wch: 12 }, // Trips
        { wch: 14 }, // Volume
        { wch: 14 }, // Distance
      ];
      
      if (hasFinancialAccess) {
        summaryColWidths.push(
          { wch: 16 }, // Base Revenue
          { wch: 14 }, // VAT
          { wch: 18 }, // Car Rental
          { wch: 16 }  // Total
        );
      }
      
      summaryWs['!cols'] = summaryColWidths;
      
      // Apply styles to summary sheet
      applyCellStyle(summaryWs, 'A1:A1', titleStyle);
      applyCellStyle(summaryWs, 'A2:C2', subHeaderStyle);
      
      // Style the headers (row 5)
      const headerRange = `A5:${hasFinancialAccess ? 'H5' : 'D5'}`;
      applyCellStyle(summaryWs, headerRange, headerStyle);
      
      // Style the data rows
      for (let i = 0; i < statistics.length; i++) {
        const rowIndex = i + 6; // +6 because summary data starts at row 6
        const dataRange = `A${rowIndex}:${hasFinancialAccess ? 'H' : 'D'}${rowIndex}`;
        applyCellStyle(summaryWs, dataRange, cellStyle);
        
        // Apply number format to numeric columns
        applyCellStyle(summaryWs, `B${rowIndex}:D${rowIndex}`, numberCellStyle);
        
        if (hasFinancialAccess) {
          applyCellStyle(summaryWs, `E${rowIndex}:H${rowIndex}`, currencyCellStyle);
        }
      }
      
      // Style the totals row
      const totalsRowIndex = statistics.length + 6;
      const totalsRange = `A${totalsRowIndex}:${hasFinancialAccess ? 'H' : 'D'}${totalsRowIndex}`;
      applyCellStyle(summaryWs, totalsRange, totalRowStyle);
      
      // Add the summary sheet to workbook
      XLSX.utils.book_append_sheet(wb, summaryWs, translate('Summary'));
      
      // Create detailed sheets for each company
      statistics.forEach(company => {
        if (company.details && company.details.length > 0) {
          const detailsData = [];
          
          // Add company name as title
          detailsData.push([translateCompanyName(company.company)]);
          detailsData.push([]); // Empty row
          
          // Add date range
          detailsData.push([translate('Date Range'), translate('From'), translate('To')]);
          detailsData.push(['', filters?.startDate || '', filters?.endDate || '']);
          detailsData.push([]); // Empty row
          
          // Define column headers based on company type
          const hasVAT = company.company === "Watanya" || company.company === "TAQA";
          const hasCarRental = company.company === "TAQA";
          
          // Headers for details
          const detailHeaders = [
            translate('Group'),
            translate('Trips'),
            translate('Volume (L)'),
            translate('Distance (km)')
          ];
          
          if (hasFinancialAccess) {
            detailHeaders.push(translate('Fee'));
            detailHeaders.push(translate('Base Revenue'));
            
            if (hasCarRental) {
              detailHeaders.push(
                translate('Cars'),
                translate('Days'),
                translate('Car Rental Fees')
              );
            }
            
            if (hasVAT) {
              detailHeaders.push(translate('VAT (14%)'));
            }
            
            if (hasVAT || hasCarRental) {
              detailHeaders.push(translate('Total'));
            }
          }
          
          detailsData.push(detailHeaders);
          
          // Add details data
          company.details.forEach(detail => {
            const row = [
              detail.group_name,
              detail.total_trips || 0,
              detail.total_volume || 0,
              detail.total_distance || 0
            ];
            
            if (hasFinancialAccess) {
              row.push(
                detail.fee || 0,
                detail.total_revenue || 0
              );
              
              if (hasCarRental) {
                row.push(
                  detail.distinct_cars || 0,
                  detail.distinct_days || 0,
                  detail.car_rental || 0
                );
              }
              
              if (hasVAT) {
                row.push(detail.vat || 0);
              }
              
              if (hasVAT || hasCarRental) {
                row.push(
                  detail.total_with_vat || 
                  ((detail.total_revenue || 0) + (detail.vat || 0) + (detail.car_rental || 0))
                );
              }
            }
            
            detailsData.push(row);
          });
          
          // Add totals row
          const detailTotals = company.details.reduce((acc, detail) => {
            acc.totalTrips += (detail.total_trips || 0);
            acc.totalVolume += (detail.total_volume || 0);
            acc.totalDistance += (detail.total_distance || 0);
            acc.totalFee += (detail.fee || 0);
            acc.totalRevenue += (detail.total_revenue || 0);
            acc.totalCars += (detail.distinct_cars || 0);
            acc.totalDays += (detail.distinct_days || 0);
            acc.totalCarRental += (detail.car_rental || 0);
            acc.totalVAT += (detail.vat || 0);
            acc.totalAmount += (detail.total_with_vat || 
              ((detail.total_revenue || 0) + (detail.vat || 0) + (detail.car_rental || 0)));
            return acc;
          }, { 
            totalTrips: 0, totalVolume: 0, totalDistance: 0, totalFee: 0, 
            totalRevenue: 0, totalCars: 0, totalDays: 0, 
            totalCarRental: 0, totalVAT: 0, totalAmount: 0 
          });
          
          const totalRow = [
            translate('Total'),
            detailTotals.totalTrips,
            detailTotals.totalVolume,
            detailTotals.totalDistance
          ];
          
          if (hasFinancialAccess) {
            totalRow.push(
              detailTotals.totalFee,
              detailTotals.totalRevenue
            );
            
            if (hasCarRental) {
              totalRow.push(
                detailTotals.totalCars,
                detailTotals.totalDays,
                detailTotals.totalCarRental
              );
            }
            
            if (hasVAT) {
              totalRow.push(detailTotals.totalVAT);
            }
            
            if (hasVAT || hasCarRental) {
              totalRow.push(detailTotals.totalAmount);
            }
          }
          
          detailsData.push(totalRow);
          
          // Create worksheet for company details
          const detailsWs = XLSX.utils.aoa_to_sheet(detailsData);
          
          // Set column widths for detail sheet
          const detailColWidths = [
            { wch: 22 }, // Group name
            { wch: 10 }, // Trips
            { wch: 13 }, // Volume
            { wch: 13 }, // Distance
          ];
          
          if (hasFinancialAccess) {
            detailColWidths.push(
              { wch: 10 }, // Fee
              { wch: 14 } // Base Revenue
            );
            
            if (hasCarRental) {
              detailColWidths.push(
                { wch: 10 }, // Cars
                { wch: 10 }, // Days
                { wch: 16 } // Car Rental
              );
            }
            
            if (hasVAT) {
              detailColWidths.push({ wch: 12 }); // VAT
            }
            
            if (hasVAT || hasCarRental) {
              detailColWidths.push({ wch: 14 }); // Total
            }
          }
          
          detailsWs['!cols'] = detailColWidths;
          
          // Apply styles to details sheet
          applyCellStyle(detailsWs, 'A1:A1', titleStyle);
          applyCellStyle(detailsWs, 'A3:C3', subHeaderStyle);
          
          // Determine how many columns we have based on company type
          let lastCol = 'D'; // Minimum 4 columns
          if (hasFinancialAccess) {
            lastCol = 'F'; // Add 2 more (Fee, Revenue)
            if (hasCarRental) lastCol = String.fromCharCode(lastCol.charCodeAt(0) + 3); // Add 3 more
            if (hasVAT) lastCol = String.fromCharCode(lastCol.charCodeAt(0) + 1); // Add 1 more
            if (hasVAT || hasCarRental) lastCol = String.fromCharCode(lastCol.charCodeAt(0) + 1); // Add 1 more
          }
          
          // Style the headers
          applyCellStyle(detailsWs, `A6:${lastCol}6`, headerStyle);
          
          // Style the data rows
          for (let i = 0; i < company.details.length; i++) {
            const rowIndex = i + 7; // +7 because details data starts at row 7
            applyCellStyle(detailsWs, `A${rowIndex}:${lastCol}${rowIndex}`, cellStyle);
            
            // Apply number format to numeric columns
            applyCellStyle(detailsWs, `B${rowIndex}:D${rowIndex}`, numberCellStyle);
            
            if (hasFinancialAccess) {
              // Style the numeric financial columns
              const financialStartCol = 'E';
              applyCellStyle(detailsWs, `${financialStartCol}${rowIndex}:${lastCol}${rowIndex}`, currencyCellStyle);
              
              // Exception for non-financial columns in financial area
              if (hasCarRental) {
                applyCellStyle(detailsWs, `G${rowIndex}:H${rowIndex}`, numberCellStyle);
              }
            }
          }
          
          // Style the totals row
          const detailTotalsRowIndex = company.details.length + 7;
          applyCellStyle(detailsWs, `A${detailTotalsRowIndex}:${lastCol}${detailTotalsRowIndex}`, totalRowStyle);
          
          // Add the details sheet to workbook
          XLSX.utils.book_append_sheet(
            wb, 
            detailsWs, 
            translateCompanyName(company.company).substring(0, 31)
          );
        }
      });
      
      // Export workbook with appropriate filename
      const fileName = language === 'arabic' ? 'تقرير_الإحصائيات.xlsx' : 'Statistics_Report.xlsx';
      XLSX.writeFile(wb, fileName);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert(
        language === 'arabic' 
          ? 'حدث خطأ أثناء التصدير إلى Excel' 
          : 'An error occurred during Excel export'
      );
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
        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        dir={language === 'arabic' ? 'rtl' : 'ltr'}
      >
        <Download className="h-5 w-5" />
        <span>{language === 'arabic' ? 'تصدير إلى Excel' : 'Export to Excel'}</span>
      </button>
    </div>
  );
};

export default ExportToExcel;