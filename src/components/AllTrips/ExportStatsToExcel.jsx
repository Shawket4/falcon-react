import React, { useState } from 'react';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { Download, Languages } from 'lucide-react';

const ExportToExcel = ({ statistics, hasFinancialAccess, filters }) => {
  const [language, setLanguage] = useState('english'); // Default language is English

  // Company name translations
  const companyTranslations = {
    'Petrol Arrows': 'السهام البترولية',
    'TAQA': 'طاقة',
    'Watanya': 'وطنية'
  };

  // Group name translations
  const groupTranslations = {
    'Beni Sweif': 'بني سويف',
    'Fayoum': 'الفيوم',
    'Qena': 'قنا',
    'Alex': 'اسكندرية',
    'Suez': 'السويس',
    'Fee 1': 'الفئة الاولي',
    'Fee 2': 'الفئة التانية',
    'Fee 3': 'الفئة التالتة',
    'Fee 4': 'الفئة الرابعة',
    'Fee 5': 'الفئة الخامسة'
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
    'Statistics Report': 'تقرير الإحصائيات',
    'Summary': 'ملخص',
    'Company Summary': 'ملخص الشركات',
    'Details': 'تفاصيل'
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

  // Translate group name based on selected language
  const translateGroupName = (name) => {
    if (language === 'arabic' && groupTranslations[name]) {
      return groupTranslations[name];
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

  const exportToExcel = async () => {
    if (!statistics || statistics.length === 0) {
      alert(language === 'arabic' ? 'لا توجد بيانات للتصدير' : 'No data to export');
      return;
    }

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
      
      // Add a worksheet
      const worksheet = workbook.addWorksheet(translate('Summary'), {
        views: [{ rightToLeft: language === 'arabic' }]
      });
      
      // Define styles
      const reportTitleStyle = {
        font: { bold: true, size: 18, color: { argb: 'FFFFFF' } },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '3B82F6' } },
        alignment: { 
          horizontal: language === 'arabic' ? 'right' : 'left', 
          vertical: 'middle'
        },
        border: {
          bottom: { style: 'medium', color: { argb: '000000' } }
        }
      };
      
      const sectionTitleStyle = {
        font: { bold: true, size: 16 },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E5E7EB' } },
        alignment: { 
          horizontal: language === 'arabic' ? 'right' : 'left', 
          vertical: 'middle'
        },
        border: {
          top: { style: 'thin', color: { argb: '000000' } },
          bottom: { style: 'thin', color: { argb: '000000' } }
        }
      };
      
      const dateHeaderStyle = {
        font: { bold: true, italic: true, size: 12, color: { argb: '4B5563' } },
        alignment: { 
          horizontal: language === 'arabic' ? 'right' : 'left', 
          vertical: 'middle'
        }
      };
      
      const dateValueStyle = {
        font: { size: 12, color: { argb: '4B5563' } },
        alignment: { 
          horizontal: 'center', 
          vertical: 'middle'
        }
      };
      
      const tableHeaderStyle = {
        font: { bold: true, size: 12, color: { argb: 'FFFFFF' } },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '3B82F6' } },
        alignment: { 
          horizontal: 'center', 
          vertical: 'middle',
          wrapText: true
        },
        border: {
          top: { style: 'thin', color: { argb: '000000' } },
          bottom: { style: 'thin', color: { argb: '000000' } },
          left: { style: 'thin', color: { argb: '000000' } },
          right: { style: 'thin', color: { argb: '000000' } }
        }
      };
      
      const companyHeaderStyle = {
        font: { bold: true, size: 14, color: { argb: 'FFFFFF' } },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '10B981' } }, // Green
        alignment: { 
          horizontal: language === 'arabic' ? 'right' : 'left', 
          vertical: 'middle'
        },
        border: {
          top: { style: 'thin', color: { argb: '000000' } },
          bottom: { style: 'thin', color: { argb: '000000' } }
        }
      };
      
      const cellStyle = {
        alignment: { 
          horizontal: 'center', 
          vertical: 'middle'
        },
        border: {
          top: { style: 'thin', color: { argb: 'D1D5DB' } },
          bottom: { style: 'thin', color: { argb: 'D1D5DB' } },
          left: { style: 'thin', color: { argb: 'D1D5DB' } },
          right: { style: 'thin', color: { argb: 'D1D5DB' } }
        }
      };
      
      const groupStyle = {
        font: { bold: true },
        alignment: { 
          horizontal: language === 'arabic' ? 'right' : 'left', 
          vertical: 'middle'
        },
        border: {
          top: { style: 'thin', color: { argb: 'D1D5DB' } },
          bottom: { style: 'thin', color: { argb: 'D1D5DB' } },
          left: { style: 'thin', color: { argb: 'D1D5DB' } },
          right: { style: 'thin', color: { argb: 'D1D5DB' } }
        }
      };
      
      const companyTotalStyle = {
        font: { bold: true, size: 12 },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F3F4F6' } },
        alignment: { 
          horizontal: 'center', 
          vertical: 'middle'
        },
        border: {
          top: { style: 'thin', color: { argb: '000000' } },
          bottom: { style: 'thin', color: { argb: '000000' } },
          left: { style: 'thin', color: { argb: '000000' } },
          right: { style: 'thin', color: { argb: '000000' } }
        }
      };
      
      // Set column widths
      const columnWidths = [
        { width: 22 }, // Company/Group name
        { width: 12 }, // Trips
        { width: 14 }, // Volume
        { width: 14 }, // Distance
      ];
      
      if (hasFinancialAccess) {
        columnWidths.push(
          { width: 12 }, // Fee
          { width: 16 }, // Base Revenue
          { width: 14 }, // VAT/Cars
          { width: 14 }, // Car Rental/Days
          { width: 18 }, // Total Amount/Car Rental
          { width: 16 }, // VAT
          { width: 16 }  // Total
        );
      }
      
      // Apply column widths
      worksheet.columns = columnWidths;
      
      // Add report title
      const titleRow = worksheet.addRow([translate('Statistics Report')]);
      titleRow.height = 30;
      const titleCell = titleRow.getCell(1);
      titleCell.style = reportTitleStyle;
      worksheet.mergeCells(`A1:${hasFinancialAccess ? 'H1' : 'D1'}`);
      
      // Add empty row
      worksheet.addRow([]);
      
      // Add date range
      const dateHeaderRow = worksheet.addRow([translate('Date Range'), translate('From'), translate('To')]);
      for (let i = 1; i <= 3; i++) {
        dateHeaderRow.getCell(i).style = dateHeaderStyle;
      }
      
      const dateValueRow = worksheet.addRow(['', filters?.startDate || '', filters?.endDate || '']);
      for (let i = 2; i <= 3; i++) {
        dateValueRow.getCell(i).style = dateValueStyle;
      }
      
      // Add empty row
      worksheet.addRow([]);
      
      // Add company summary section title
      const companySummaryTitleRow = worksheet.addRow([translate('Company Summary')]);
      companySummaryTitleRow.height = 24;
      companySummaryTitleRow.getCell(1).style = sectionTitleStyle;
      worksheet.mergeCells(`A6:${hasFinancialAccess ? 'H6' : 'D6'}`);
      
      // Add company summary headers
      const companyHeaders = [
        translate('Company'), 
        translate('Trips'), 
        translate('Volume (L)'), 
        translate('Distance (km)')
      ];
      
      if (hasFinancialAccess) {
        companyHeaders.push(
          translate('Base Revenue'),
          translate('VAT (14%)'),
          translate('Car Rental Fees'),
          translate('Total Amount')
        );
      }
      
      const companyHeaderRow = worksheet.addRow(companyHeaders);
      companyHeaderRow.height = 20;
      for (let i = 1; i <= companyHeaders.length; i++) {
        companyHeaderRow.getCell(i).style = tableHeaderStyle;
      }
      
      // Calculate company totals
      const companyTotals = {
        totalTrips: 0, 
        totalVolume: 0, 
        totalDistance: 0, 
        totalRevenue: 0,
        totalVAT: 0,
        totalCarRent: 0
      };
      
      // Add summary data for each company
      statistics.forEach(company => {
        const companyData = [
          translateCompanyName(company.company),
          company.total_trips || 0,
          company.total_volume || 0,
          company.total_distance || 0
        ];
        
        // Update totals
        companyTotals.totalTrips += (company.total_trips || 0);
        companyTotals.totalVolume += (company.total_volume || 0);
        companyTotals.totalDistance += (company.total_distance || 0);
        
        if (hasFinancialAccess) {
          companyData.push(
            company.total_revenue || 0,
            company.total_vat || 0,
            company.total_car_rent || 0,
            (company.total_revenue || 0) + (company.total_vat || 0) + (company.total_car_rent || 0)
          );
          
          companyTotals.totalRevenue += (company.total_revenue || 0);
          companyTotals.totalVAT += (company.total_vat || 0);
          companyTotals.totalCarRent += (company.total_car_rent || 0);
        }
        
        const companyRow = worksheet.addRow(companyData);
        
        // Style the company row
        companyRow.getCell(1).style = groupStyle;
        
        for (let i = 2; i <= 4; i++) {
          const cell = companyRow.getCell(i);
          cell.style = cellStyle;
          cell.numFmt = '#,##0.00';
        }
        
        if (hasFinancialAccess) {
          for (let i = 5; i <= 8; i++) {
            const cell = companyRow.getCell(i);
            cell.style = cellStyle;
            cell.numFmt = '$#,##0.00';
          }
        }
      });
      
      // Add company totals row
      const totalAmountCalc = companyTotals.totalRevenue + companyTotals.totalVAT + companyTotals.totalCarRent;
      
      const companyTotalData = [
        translate('Total'),
        companyTotals.totalTrips,
        companyTotals.totalVolume,
        companyTotals.totalDistance
      ];
      
      if (hasFinancialAccess) {
        companyTotalData.push(
          companyTotals.totalRevenue,
          companyTotals.totalVAT,
          companyTotals.totalCarRent,
          totalAmountCalc
        );
      }
      
      const companyTotalRow = worksheet.addRow(companyTotalData);
      companyTotalRow.height = 22;
      
      // Style the totals row
      for (let i = 1; i <= companyTotalData.length; i++) {
        companyTotalRow.getCell(i).style = companyTotalStyle;
        
        // Apply number format
        if (i > 1) {
          if (i <= 4 || !hasFinancialAccess) {
            companyTotalRow.getCell(i).numFmt = '#,##0.00';
          } else {
            companyTotalRow.getCell(i).numFmt = '$#,##0.00';
          }
        }
      }
      
      // Add empty rows
      worksheet.addRow([]);
      worksheet.addRow([]);
      
      // Add detailed sections for each company
      let currentRowIndex = companyTotalRow.number + 3; // +3 for the two empty rows
      
      statistics.forEach((company, companyIndex) => {
        if (company.details && company.details.length > 0) {
          // Add company header
          const companyDetailTitleRow = worksheet.getRow(currentRowIndex);
          companyDetailTitleRow.height = 24;
          
          companyDetailTitleRow.getCell(1).value = `${translateCompanyName(company.company)} ${translate('Details')}`;
          companyDetailTitleRow.getCell(1).style = companyHeaderStyle;
          
          // Determine last column for merging based on company type
          const hasVAT = company.company === "Watanya" || company.company === "TAQA";
          const hasCarRental = company.company === "TAQA";
          
          let lastColIndex = 4; // Default (A-D)
          if (hasFinancialAccess) {
            lastColIndex = 6; // With Fee and Revenue (A-F)
            if (hasCarRental) lastColIndex += 3; // Add Cars, Days, Car Rental
            if (hasVAT) lastColIndex += 1; // Add VAT
            if (hasVAT || hasCarRental) lastColIndex += 1; // Add Total
          }
          
          // Get column letter
          const lastColLetter = String.fromCharCode(64 + lastColIndex); // 65=A, 66=B, etc.
          worksheet.mergeCells(`A${currentRowIndex}:${lastColLetter}${currentRowIndex}`);
          
          currentRowIndex++;
          
          // Add column headers for details
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
          
          const detailHeaderRow = worksheet.getRow(currentRowIndex);
          detailHeaderRow.values = detailHeaders;
          detailHeaderRow.height = 20;
          
          // Style detail header row
          for (let i = 1; i <= detailHeaders.length; i++) {
            detailHeaderRow.getCell(i).style = tableHeaderStyle;
          }
          
          currentRowIndex++;
          
          // Track group totals
          const groupTotals = {
            totalTrips: 0, 
            totalVolume: 0, 
            totalDistance: 0, 
            totalFee: 0,
            totalRevenue: 0, 
            totalCars: 0, 
            totalDays: 0, 
            totalCarRental: 0, 
            totalVAT: 0, 
            totalAmount: 0
          };
          
          // Add group data rows
          company.details.forEach(detail => {
            const groupRow = worksheet.getRow(currentRowIndex);
            
            // Set values
            const rowData = [
              translateGroupName(detail.group_name),
              detail.total_trips || 0,
              detail.total_volume || 0,
              detail.total_distance || 0
            ];
            
            // Update totals
            groupTotals.totalTrips += (detail.total_trips || 0);
            groupTotals.totalVolume += (detail.total_volume || 0);
            groupTotals.totalDistance += (detail.total_distance || 0);
            
            if (hasFinancialAccess) {
              rowData.push(
                detail.fee || 0,
                detail.total_revenue || 0
              );
              
              groupTotals.totalFee += (detail.fee || 0);
              groupTotals.totalRevenue += (detail.total_revenue || 0);
              
              if (hasCarRental) {
                rowData.push(
                  detail.distinct_cars || 0,
                  detail.distinct_days || 0,
                  detail.car_rental || 0
                );
                
                groupTotals.totalCars += (detail.distinct_cars || 0);
                groupTotals.totalDays += (detail.distinct_days || 0);
                groupTotals.totalCarRental += (detail.car_rental || 0);
              }
              
              if (hasVAT) {
                rowData.push(detail.vat || 0);
                groupTotals.totalVAT += (detail.vat || 0);
              }
              
              if (hasVAT || hasCarRental) {
                const totalAmount = (detail.total_revenue || 0) + 
                                    (detail.vat || 0) + 
                                    (detail.car_rental || 0);
                                    
                rowData.push(totalAmount);
                groupTotals.totalAmount += totalAmount;
              }
            }
            
            groupRow.values = rowData;
            
            // Style group row
            groupRow.getCell(1).style = groupStyle;
            
            // Style numeric cells
            for (let i = 2; i <= 4; i++) {
              const cell = groupRow.getCell(i);
              cell.style = cellStyle;
              cell.numFmt = '#,##0.00';
            }
            
            if (hasFinancialAccess) {
              // Style Fee and Revenue cells
              for (let i = 5; i <= 6; i++) {
                const cell = groupRow.getCell(i);
                cell.style = cellStyle;
                cell.numFmt = '$#,##0.00';
              }
              
              if (hasCarRental) {
                // Style Cars and Days cells as numbers
                for (let i = 7; i <= 8; i++) {
                  const cell = groupRow.getCell(i);
                  cell.style = cellStyle;
                  cell.numFmt = '#,##0.00';
                }
                
                // Style Car Rental as currency
                const carRentalCell = groupRow.getCell(9);
                carRentalCell.style = cellStyle;
                carRentalCell.numFmt = '$#,##0.00';
              }
              
              if (hasVAT) {
                // VAT cell is after Revenue (pos 6) or after Car Rental (pos 9)
                const vatCellIndex = hasCarRental ? 10 : 7;
                const vatCell = groupRow.getCell(vatCellIndex);
                vatCell.style = cellStyle;
                vatCell.numFmt = '$#,##0.00';
              }
              
              if (hasVAT || hasCarRental) {
                // Total cell is the last one
                const totalCell = groupRow.getCell(detailHeaders.length);
                totalCell.style = cellStyle;
                totalCell.numFmt = '$#,##0.00';
              }
            }
            
            currentRowIndex++;
          });
          
          // Add group totals row
          const groupTotalRow = worksheet.getRow(currentRowIndex);
          groupTotalRow.height = 22;
          
          const groupTotalData = [
            translate('Total'),
            groupTotals.totalTrips,
            groupTotals.totalVolume,
            groupTotals.totalDistance
          ];
          
          if (hasFinancialAccess) {
            groupTotalData.push(
              groupTotals.totalFee,
              groupTotals.totalRevenue
            );
            
            if (hasCarRental) {
              groupTotalData.push(
                groupTotals.totalCars,
                groupTotals.totalDays,
                groupTotals.totalCarRental
              );
            }
            
            if (hasVAT) {
              groupTotalData.push(groupTotals.totalVAT);
            }
            
            if (hasVAT || hasCarRental) {
              groupTotalData.push(groupTotals.totalAmount);
            }
          }
          
          groupTotalRow.values = groupTotalData;
          
          // Style the group totals row
          for (let i = 1; i <= groupTotalData.length; i++) {
            groupTotalRow.getCell(i).style = companyTotalStyle;
            
            // Apply number format
            if (i > 1) {
              if (i <= 4 || (hasCarRental && (i === 7 || i === 8))) {
                groupTotalRow.getCell(i).numFmt = '#,##0.00';
              } else {
                groupTotalRow.getCell(i).numFmt = '$#,##0.00';
              }
            }
          }
          
          currentRowIndex++;
          
          // Add empty rows between companies if not the last company
          if (companyIndex < statistics.length - 1) {
            worksheet.getRow(currentRowIndex).height = 10;
            currentRowIndex++;
            worksheet.getRow(currentRowIndex).height = 10;
            currentRowIndex++;
          }
        }
      });
      
      // Generate Excel file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      // Create filename
      const fileName = language === 'arabic' ? 'تقرير_الإحصائيات.xlsx' : 'Statistics_Report.xlsx';
      
      // Save file
      saveAs(blob, fileName);
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
        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        dir={language === 'arabic' ? 'rtl' : 'ltr'}
      >
        <Download className="h-5 w-5" />
        <span className={language === 'arabic' ? 'mr-2' : 'ml-2'}>
          {language === 'arabic' ? 'تصدير إلى Excel' : 'Export to Excel'}
        </span>
      </button>
    </div>
  );
};

export default ExportToExcel;