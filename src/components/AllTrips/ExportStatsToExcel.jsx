import React, { useState } from 'react';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { Download, Languages } from 'lucide-react';

const ExportToExcel = ({ statistics, hasFinancialAccess, filters }) => {
  const [language, setLanguage] = useState('english');
  const [isGenerating, setIsGenerating] = useState(false);
  const [includeCarDetails, setIncludeCarDetails] = useState(true);
  const [exportFormat, setExportFormat] = useState('detailed');

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
    'Fee 5': 'الفئة الخامسة',
    'All': 'الكل'
  };

  // Terminal name translations (for cars_by_terminal)
  const terminalTranslations = {
    'Alexandria': 'الاسكندرية',
    'Cairo': 'القاهرة',
    'Suez': 'السويس',
    'Alex': 'اسكندرية',
    'Beni Sweif': 'بني سويف',
    'Fayoum': 'الفيوم',
    'Qena': 'قنا'
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
    'Working Days': 'أيام العمل',
    'Total': 'المجموع',
    'Date Range': 'النطاق الزمني',
    'From': 'من',
    'To': 'إلى',
    'Statistics Report': 'تقرير الإحصائيات',
    'Summary': 'ملخص',
    'Company Summary': 'ملخص الشركات',
    'Details': 'تفاصيل',
    'Car': 'سيارة',
    'Plate Number': 'رقم اللوحة',
    'Trip Count': 'عدد الرحلات',
    'First Trip': 'الرحلة الأولى',
    'Last Trip': 'الرحلة الأخيرة',
    'Car Details': 'تفاصيل السيارات',
    'Terminal': 'المحطة',
    'Drop-off Points': 'نقاط التسليم',
    'Cars by Terminal': 'السيارات حسب المحطة',
    'Export to Excel': 'تصدير إلى Excel',
    'Export Format': 'صيغة التصدير',
    'Detailed': 'مفصل',
    'Summary Only': 'ملخص فقط',
    'Include Car Details': 'تضمين تفاصيل السيارات',
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

  // Translate company name based on selected language
  const translateCompanyName = (name) => {
    if (!name) return '';
    if (language === 'arabic' && companyTranslations[name]) {
      return companyTranslations[name];
    }
    return name;
  };

  // Translate group name based on selected language
  const translateGroupName = (name) => {
    if (!name) return '';
    if (language === 'arabic' && groupTranslations[name]) {
      return groupTranslations[name];
    }
    return name;
  };

  // Translate terminal name based on selected language
  const translateTerminalName = (name) => {
    if (!name) return '';
    if (language === 'arabic' && terminalTranslations[name]) {
      return terminalTranslations[name];
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

  // Helper function to sanitize sheet names
  const sanitizeSheetName = (name) => {
    // Excel sheet names must be 31 characters or less
    // and cannot contain certain characters
    if (!name) return 'Sheet';
    
    // Replace invalid characters with underscores
    let safeName = String(name).replace(/[\\/:*?"<>|[\]]/g, '_');
    
    // Trim to 31 characters max
    safeName = safeName.substring(0, 31);
    
    return safeName;
  };

  const exportToExcel = async () => {
    if (!statistics || statistics.length === 0) {
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
      
      const companyNameStyle = {
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
        { width: 25 }, // Company/Group name
        { width: 20 }, // Trips
        { width: 20 }, // Volume
        { width: 20 }, // Distance
      ];
      
      if (hasFinancialAccess) {
        columnWidths.push(
          { width: 20 }, // Base Revenue
          { width: 20 }, // VAT
          { width: 20 }, // Car Rental
          { width: 20 }  // Total Amount
        );
      }
      
      // Apply column widths
      summarySheet.columns = columnWidths;
      
      // Add report title
      const titleRow = summarySheet.addRow([translate('Statistics Report')]);
      titleRow.height = 40;
      const titleCell = titleRow.getCell(1);
      titleCell.style = reportTitleStyle;
      const lastCol = hasFinancialAccess ? 8 : 4;
      summarySheet.mergeCells(`A1:${String.fromCharCode(64 + lastCol)}1`);
      
      // Add empty row
      summarySheet.addRow([]);
      
      // Add date range
      const dateHeaderRow = summarySheet.addRow([translate('Date Range'), translate('From'), translate('To')]);
      dateHeaderRow.height = 30;
      for (let i = 1; i <= 3; i++) {
        dateHeaderRow.getCell(i).style = dateHeaderStyle;
      }
      
      const startDate = filters && (filters.startDate || filters.start_date) ? (filters.startDate || filters.start_date) : '';
      const endDate = filters && (filters.endDate || filters.end_date) ? (filters.endDate || filters.end_date) : '';
      const dateValueRow = summarySheet.addRow(['', startDate, endDate]);
      dateValueRow.height = 30;
      for (let i = 2; i <= 3; i++) {
        dateValueRow.getCell(i).style = dateValueStyle;
      }
      
      // Add empty row
      summarySheet.addRow([]);
      
      // Add company summary section title
      const companySummaryTitleRow = summarySheet.addRow([translate('Company Summary')]);
      companySummaryTitleRow.height = 35;
      companySummaryTitleRow.getCell(1).style = sectionTitleStyle;
      summarySheet.mergeCells(`A6:${String.fromCharCode(64 + lastCol)}6`);
      
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
      
      const companyHeaderRow = summarySheet.addRow(companyHeaders);
      companyHeaderRow.height = 35;
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
      statistics.forEach((company, index) => {
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
        
        const companyRow = summarySheet.addRow(companyData);
        companyRow.height = 30;
        
        // Style the company row
        companyRow.getCell(1).style = companyNameStyle;
        
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
        
        // Add alternating row colors
        if (index % 2 === 1) {
          for (let i = 1; i <= lastCol; i++) {
            companyRow.getCell(i).fill = { 
              type: 'pattern', 
              pattern: 'solid', 
              fgColor: { argb: 'F9FAFB' } 
            };
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
      
      const companyTotalRow = summarySheet.addRow(companyTotalData);
      companyTotalRow.height = 35;
      
      // Style the totals row
      companyTotalRow.getCell(1).style = totalLabelStyle;
      
      for (let i = 2; i <= companyTotalData.length; i++) {
        companyTotalRow.getCell(i).style = totalRowStyle;
        
        // Apply number format
        if (i > 1) {
          if (i <= 4 || !hasFinancialAccess) {
            companyTotalRow.getCell(i).numFmt = '#,##0.00';
          } else {
            companyTotalRow.getCell(i).numFmt = '$#,##0.00';
          }
        }
      }
      
      // Add footer with page number
      summarySheet.headerFooter.oddFooter = "&C&B" + translate('Page') + " 1";

      // If user only wants summary, skip the detailed sheets
      if (exportFormat === 'detailed') {
        // ====== COMPANY DETAIL SHEETS - One sheet per company ======
        let sheetIndex = 2; // Start at 2 (after Summary sheet)
        
        // Create a map to store car details by terminal for each company
        // This will be used to create separate sheets for terminal car details
        const terminalCarSheetsToCreate = [];

        statistics.forEach((company, companyIndex) => {
          // Store company car details by terminal for later sheet creation
          if (company.cars_by_terminal && includeCarDetails) {
            Object.keys(company.cars_by_terminal || {}).forEach(terminal => {
              if (terminal && company.cars_by_terminal[terminal]) {
                terminalCarSheetsToCreate.push({
                  company: company.company,
                  terminal: terminal,
                  cars: company.cars_by_terminal[terminal]
                });
              }
            });
          }
          
          if (company.details && company.details.length > 0) {
            // Create a new worksheet for each company
            const detailSheet = workbook.addWorksheet(sanitizeSheetName(translateCompanyName(company.company)), {
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
            
            // Apply column widths to detail sheet
            detailSheet.columns = columnWidths;
            
            // Add report title to detail sheet
            const detailTitleRow = detailSheet.addRow([translate('Statistics Report')]);
            detailTitleRow.height = 40;
            detailTitleRow.getCell(1).style = reportTitleStyle;
            
            // Determine which columns to include for this company
            const hasVAT = company.company === "Watanya" || company.company === "TAQA";
            const hasCarRental = company.company === "TAQA";
            
            let detailLastCol = 4; // Default (A-D)
            if (hasFinancialAccess) {
              detailLastCol = 6; // With Fee and Revenue (A-F)
              if (hasCarRental) detailLastCol += 3; // Add Cars, Days, Car Rental
              if (hasVAT) detailLastCol += 1; // Add VAT
              if (hasVAT || hasCarRental) detailLastCol += 1; // Add Total
            }
            
            detailSheet.mergeCells(`A1:${String.fromCharCode(64 + detailLastCol)}1`);
            
            // Add date range to detail sheet
            detailSheet.addRow([]);
            const detailDateHeaderRow = detailSheet.addRow([translate('Date Range'), translate('From'), translate('To')]);
            detailDateHeaderRow.height = 30;
            for (let i = 1; i <= 3; i++) {
              detailDateHeaderRow.getCell(i).style = dateHeaderStyle;
            }
            
            const detailDateValueRow = detailSheet.addRow(['', startDate, endDate]);
            detailDateValueRow.height = 30;
            for (let i = 2; i <= 3; i++) {
              detailDateValueRow.getCell(i).style = dateValueStyle;
            }
            
            detailSheet.addRow([]);
            
            // Add company details header with green background
            const companyDetailHeaderStyle = {
              ...sectionTitleStyle,
              fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '10B981' } },
              font: { bold: true, size: 18, color: { argb: 'FFFFFF' } }
            };
            
            const detailHeaderRow = detailSheet.addRow([`${translateCompanyName(company.company)} ${translate('Details')}`]);
            detailHeaderRow.height = 35;
            detailHeaderRow.getCell(1).style = companyDetailHeaderStyle;
            detailSheet.mergeCells(`A6:${String.fromCharCode(64 + detailLastCol)}6`);
            
            // Add column headers for details
            const detailTableHeaderStyle = {
              ...tableHeaderStyle,
              fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '10B981' } }
            };
            
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
            
            const detailHeadersRow = detailSheet.addRow(detailHeaders);
            detailHeadersRow.height = 35;
            for (let i = 1; i <= detailHeaders.length; i++) {
              detailHeadersRow.getCell(i).style = detailTableHeaderStyle;
            }
            
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
            company.details.forEach((detail, detailIndex) => {
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
              
              const groupRow = detailSheet.addRow(rowData);
              groupRow.height = 30;
              
              // Style the group row
              groupRow.getCell(1).style = companyNameStyle;
              
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
                  const carRentalCellIndex = 9;
                  const carRentalCell = groupRow.getCell(carRentalCellIndex);
                  carRentalCell.style = cellStyle;
                  carRentalCell.numFmt = '$#,##0.00';
                }
                
                if (hasVAT) {
                  // VAT cell is after Revenue (pos 7) or after Car Rental (pos 10)
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
              
              // Add alternating row colors
              if (detailIndex % 2 === 1) {
                for (let i = 1; i <= detailHeaders.length; i++) {
                  groupRow.getCell(i).fill = { 
                    type: 'pattern', 
                    pattern: 'solid', 
                    fgColor: { argb: 'F9FAFB' } 
                  };
                }
              }
              
              // Create a sheet for the car details of this group if there are cars
              if (includeCarDetails && detail.cars && detail.cars.length > 0) {
                // Create car details sheet for this group
                const prefix = company.company ? company.company.substring(0, 3) : 'CO';
                const groupPrefix = detail.group_name ? detail.group_name.substring(0, 3) : 'GRP';
                const carSheetName = sanitizeSheetName(`${prefix}_${groupPrefix}_Cars`);
                
                // Check if worksheet already exists
                if (workbook.getWorksheet(carSheetName)) {

                } else {
                const carDetailsSheet = workbook.addWorksheet(carSheetName, {
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
                
                // Set columns for car details sheet
                carDetailsSheet.columns = [
                  { width: 22 }, // Plate Number
                  { width: 15 }, // Trip Count
                  { width: 20 }, // Volume
                  { width: 20 }, // Distance
                  { width: 15 }, // Working Days
                  { width: 18 }, // First Trip
                  { width: 18 }, // Last Trip
                  { width: 30 }, // Drop-off Points
                ];
                
                // Add title to car details sheet
                const carTitleRow = carDetailsSheet.addRow([`${translateCompanyName(company.company)} - ${translateGroupName(detail.group_name)} - ${translate('Car Details')}`]);
                carTitleRow.height = 40;
                carTitleRow.getCell(1).style = reportTitleStyle;
                carDetailsSheet.mergeCells('A1:H1');
                
                // Add date range
                carDetailsSheet.addRow([]);
                const carDateHeaderRow = carDetailsSheet.addRow([translate('Date Range'), translate('From'), translate('To')]);
                carDateHeaderRow.height = 30;
                for (let i = 1; i <= 3; i++) {
                  carDateHeaderRow.getCell(i).style = dateHeaderStyle;
                }
                
                const carDateValueRow = carDetailsSheet.addRow(['', startDate, endDate]);
                carDateValueRow.height = 30;
                for (let i = 2; i <= 3; i++) {
                  carDateValueRow.getCell(i).style = dateValueStyle;
                }
                
                carDetailsSheet.addRow([]);
                
                // Add car details header
                const carDetailHeaderStyle = {
                  ...sectionTitleStyle,
                  fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '8B5CF6' } }, // Purple color
                  font: { bold: true, size: 18, color: { argb: 'FFFFFF' } }
                };
                
                const carHeaderRow = carDetailsSheet.addRow([`${translate('Cars')} - ${translateGroupName(detail.group_name)}`]);
                carHeaderRow.height = 35;
                carHeaderRow.getCell(1).style = carDetailHeaderStyle;
                carDetailsSheet.mergeCells('A6:H6');
                
                // Add column headers for car details
                const carTableHeaderStyle = {
                  ...tableHeaderStyle,
                  fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '8B5CF6' } } // Purple color
                };
                
                const carDetailHeaders = [
                  translate('Plate Number'),
                  translate('Trip Count'),
                  translate('Volume (L)'),
                  translate('Distance (km)'),
                  translate('Working Days'),
                  translate('First Trip'),
                  translate('Last Trip'),
                  translate('Drop-off Points'),
                ];
                
                const carHeadersRow = carDetailsSheet.addRow(carDetailHeaders);
                carHeadersRow.height = 35;
                for (let i = 1; i <= carDetailHeaders.length; i++) {
                  carHeadersRow.getCell(i).style = carTableHeaderStyle;
                }
                
                // Add car data rows
                detail.cars.forEach((car, carIndex) => {
                  const dropOffPointsText = car.drop_off_points ? car.drop_off_points.join(', ') : '';
                  
                  const carData = [
                    car.car_no_plate || '',
                    car.trip_count || 0,
                    car.total_volume || 0,
                    car.total_distance || 0,
                    car.working_days || 0,
                    car.first_trip_date || '',
                    car.last_trip_date || '',
                    dropOffPointsText
                  ];
                  
                  const carRow = carDetailsSheet.addRow(carData);
                  carRow.height = 30;
                  
                  // Style car plate cell
                  carRow.getCell(1).style = {
                    ...companyNameStyle,
                    alignment: { 
                      horizontal: 'center', 
                      vertical: 'middle'
                    }
                  };
                  
                  // Style numeric cells
                  for (let i = 2; i <= 5; i++) {
                    const cell = carRow.getCell(i);
                    cell.style = cellStyle;
                    cell.numFmt = '#,##0.00';
                  }
                  
                  // Style date cells
                  for (let i = 6; i <= 7; i++) {
                    const cell = carRow.getCell(i);
                    cell.style = cellStyle;
                  }
                  
                  // Style drop-off points cell
                  const dropOffCell = carRow.getCell(8);
                  dropOffCell.style = {
                    ...cellStyle,
                    alignment: { 
                      horizontal: language === 'arabic' ? 'right' : 'left', 
                      vertical: 'middle',
                      wrapText: true
                    }
                  };
                  
                  // Add alternating row colors
                  if (carIndex % 2 === 1) {
                    for (let i = 1; i <= carDetailHeaders.length; i++) {
                      carRow.getCell(i).fill = { 
                        type: 'pattern', 
                        pattern: 'solid', 
                        fgColor: { argb: 'F9FAFB' } 
                      };
                    }
                  }
                });
                
                // Add page number in footer
                carDetailsSheet.headerFooter.oddFooter = "&C&B" + translate('Page') + " " + (sheetIndex++);
              }
            }
            });
          // Add group totals row
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
          
          const groupTotalRow = detailSheet.addRow(groupTotalData);
          groupTotalRow.height = 35;
          
          // Style the group totals row
          groupTotalRow.getCell(1).style = totalLabelStyle;
          
          for (let i = 2; i <= groupTotalData.length; i++) {
            groupTotalRow.getCell(i).style = totalRowStyle;
            
            // Apply number format
            if (i > 1) {
              if (i <= 4 || (hasCarRental && (i === 7 || i === 8))) {
                groupTotalRow.getCell(i).numFmt = '#,##0.00';
              } else {
                groupTotalRow.getCell(i).numFmt = '$#,##0.00';
              }
            }
          }
          
          // Add page number in footer
          detailSheet.headerFooter.oddFooter = "&C&B" + translate('Page') + " " + (sheetIndex++);
          
          // Create a section for Cars by Terminal summary at the bottom of the detail sheet
          if (includeCarDetails && company.cars_by_terminal && Object.keys(company.cars_by_terminal || {}).length > 0) {
            // Add empty rows for separation
            detailSheet.addRow([]);
            detailSheet.addRow([]);
            
            // Add cars by terminal header with purple background
            const carTerminalHeaderStyle = {
              ...sectionTitleStyle,
              fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '8B5CF6' } },
              font: { bold: true, size: 18, color: { argb: 'FFFFFF' } }
            };
            
            const carTerminalRow = detailSheet.addRow([translate('Cars by Terminal')]);
            carTerminalRow.height = 35;
            carTerminalRow.getCell(1).style = carTerminalHeaderStyle;
            detailSheet.mergeCells(`A${carTerminalRow.number}:${String.fromCharCode(64 + detailLastCol)}${carTerminalRow.number}`);
            
            // For each terminal, add a summary row with car count
            Object.keys(company.cars_by_terminal || {}).forEach((terminal, idx) => {
              if (!terminal) return;
              
              const cars = company.cars_by_terminal[terminal] || [];
              const carCount = cars.length;
              
              // Create a link to the terminal's car detail sheet that we'll create next
              const prefix = company.company ? company.company.substring(0, 3) : 'CO';
              const termPrefix = terminal ? terminal.substring(0, 3) : 'TRM';
              const terminalSheetName = sanitizeSheetName(`${prefix}_${termPrefix}_Cars`);
              
              const terminalRow = detailSheet.addRow([
                `${translateTerminalName(terminal)} (${translate('Cars')}: ${carCount})`
              ]);
              
              terminalRow.height = 30;
              terminalRow.getCell(1).style = {
                ...companyNameStyle,
                font: { bold: true, size: 14, color: { argb: '4F46E5' }, underline: true }
              };
              
              // Add hyperlink to the car details sheet
              terminalRow.getCell(1).value = {
                text: `${translateTerminalName(terminal)} (${translate('Cars')}: ${carCount})`,
                hyperlink: `#'${terminalSheetName}'!A1`
              };
              
              // Color alternating rows
              if (idx % 2 === 1) {
                terminalRow.getCell(1).fill = { 
                  type: 'pattern', 
                  pattern: 'solid', 
                  fgColor: { argb: 'F3F4F6' } 
                };
              }
            });
          }
        }
      });
      
      // ====== TERMINAL CAR DETAILS SHEETS - One sheet per terminal for each company ======
      // Create the terminal car details sheets if user wants car details
      if (includeCarDetails) {
        terminalCarSheetsToCreate.forEach(({ company, terminal, cars }) => {
          if (!company || !terminal || !cars || !cars.length) return;
          
          // Create car details sheet for this terminal
          const prefix = company ? company.substring(0, 3) : 'CO';
          const termPrefix = terminal ? terminal.substring(0, 3) : 'TRM';
          const terminalSheetName = sanitizeSheetName(`${prefix}_${termPrefix}_Cars`);
          
          // Check if worksheet already exists (might have been created earlier)
          if (workbook.getWorksheet(terminalSheetName)) {
            return;
          }
          
          const carDetailsSheet = workbook.addWorksheet(terminalSheetName, {
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
          
          // Set columns for car details sheet
          carDetailsSheet.columns = [
            { width: 22 }, // Plate Number
            { width: 15 }, // Trip Count
            { width: 20 }, // Volume
            { width: 20 }, // Distance
            { width: 15 }, // Working Days
            { width: 18 }, // First Trip
            { width: 18 }, // Last Trip
            { width: 30 }, // Drop-off Points
          ];
          
          // Add title to car details sheet
          const carTitleRow = carDetailsSheet.addRow([`${translateCompanyName(company)} - ${translateTerminalName(terminal)} - ${translate('Car Details')}`]);
          carTitleRow.height = 40;
          carTitleRow.getCell(1).style = reportTitleStyle;
          carDetailsSheet.mergeCells('A1:H1');
          
          // Add date range
          carDetailsSheet.addRow([]);
          const carDateHeaderRow = carDetailsSheet.addRow([translate('Date Range'), translate('From'), translate('To')]);
          carDateHeaderRow.height = 30;
          for (let i = 1; i <= 3; i++) {
            carDateHeaderRow.getCell(i).style = dateHeaderStyle;
          }
          
          const carDateValueRow = carDetailsSheet.addRow(['', startDate, endDate]);
          carDateValueRow.height = 30;
          for (let i = 2; i <= 3; i++) {
            carDateValueRow.getCell(i).style = dateValueStyle;
          }
          
          carDetailsSheet.addRow([]);
          
          // Add car details header
          const carDetailHeaderStyle = {
            ...sectionTitleStyle,
            fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '8B5CF6' } }, // Purple color
            font: { bold: true, size: 18, color: { argb: 'FFFFFF' } }
          };
          
          const carHeaderRow = carDetailsSheet.addRow([`${translate('Terminal')}: ${translateTerminalName(terminal)}`]);
          carHeaderRow.height = 35;
          carHeaderRow.getCell(1).style = carDetailHeaderStyle;
          carDetailsSheet.mergeCells('A6:H6');
          
          // Add column headers for car details
          const carTableHeaderStyle = {
            ...tableHeaderStyle,
            fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '8B5CF6' } } // Purple color
          };
          
          const carDetailHeaders = [
            translate('Plate Number'),
            translate('Trip Count'),
            translate('Volume (L)'),
            translate('Distance (km)'),
            translate('Working Days'),
            translate('First Trip'),
            translate('Last Trip'),
            translate('Drop-off Points'),
          ];
          
          const carHeadersRow = carDetailsSheet.addRow(carDetailHeaders);
          carHeadersRow.height = 35;
          for (let i = 1; i <= carDetailHeaders.length; i++) {
            carHeadersRow.getCell(i).style = carTableHeaderStyle;
          }
          
          // Calculate car totals for this terminal
          const carTotals = {
            totalTrips: 0,
            totalVolume: 0,
            totalDistance: 0,
            totalWorkingDays: 0
          };
          
          // Add car data rows
          cars.forEach((car, carIndex) => {
            if (!car) return;
            
            const dropOffPointsText = car.drop_off_points ? car.drop_off_points.join(', ') : '';
            
            // Update totals
            carTotals.totalTrips += (car.trip_count || 0);
            carTotals.totalVolume += (car.total_volume || 0);
            carTotals.totalDistance += (car.total_distance || 0);
            carTotals.totalWorkingDays += (car.working_days || 0);
            
            const carData = [
              car.car_no_plate || '',
              car.trip_count || 0,
              car.total_volume || 0,
              car.total_distance || 0,
              car.working_days || 0,
              car.first_trip_date || '',
              car.last_trip_date || '',
              dropOffPointsText || ''
            ];
            
            const carRow = carDetailsSheet.addRow(carData);
            carRow.height = 30;
            
            // Style car plate number cell
            carRow.getCell(1).style = {
              ...companyNameStyle,
              alignment: { 
                horizontal: 'center', 
                vertical: 'middle'
              }
            };
            
            // Style numeric cells
            for (let i = 2; i <= 5; i++) {
              const cell = carRow.getCell(i);
              cell.style = cellStyle;
              cell.numFmt = '#,##0.00';
            }
            
            // Style date cells
            for (let i = 6; i <= 7; i++) {
              const cell = carRow.getCell(i);
              cell.style = cellStyle;
            }
            
            // Style drop-off points cell
            const dropOffCell = carRow.getCell(8);
            dropOffCell.style = {
              ...cellStyle,
              alignment: { 
                horizontal: language === 'arabic' ? 'right' : 'left', 
                vertical: 'middle',
                wrapText: true
              }
            };
            
            // Add alternating row colors
            if (carIndex % 2 === 1) {
              for (let i = 1; i <= carDetailHeaders.length; i++) {
                carRow.getCell(i).fill = { 
                  type: 'pattern', 
                  pattern: 'solid', 
                  fgColor: { argb: 'F9FAFB' } 
                };
              }
            }
          });
          
          // Add totals row
          const totalData = [
            translate('Total'),
            carTotals.totalTrips,
            carTotals.totalVolume,
            carTotals.totalDistance,
            carTotals.totalWorkingDays,
            '', // No total for first trip date
            '', // No total for last trip date
            '' // No total for drop-off points
          ];
          
          const totalRow = carDetailsSheet.addRow(totalData);
          totalRow.height = 35;
          
          // Style the totals row
          totalRow.getCell(1).style = totalLabelStyle;
          
          for (let i = 2; i <= 5; i++) {
            const cell = totalRow.getCell(i);
            cell.style = totalRowStyle;
            cell.numFmt = '#,##0.00';
          }
          
          // Add page number in footer
          carDetailsSheet.headerFooter.oddFooter = "&C&B" + translate('Page') + " " + (sheetIndex++);
        });
      }
    }
    
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
  } finally {
    setIsGenerating(false);
  }
};

return (
  <div className="mb-4 flex flex-col gap-4">
    <div className="flex items-center gap-4 flex-wrap">
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
      
      <div className="border border-gray-300 rounded-md p-2">
        <div className="flex items-center space-x-2">
          <span className="text-gray-700">{translate('Export Format')}:</span>
          <select
            className="outline-none bg-transparent"
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value)}
            dir={language === 'arabic' ? 'rtl' : 'ltr'}
          >
            <option value="detailed">{translate('Detailed')}</option>
            <option value="summary">{translate('Summary Only')}</option>
          </select>
        </div>
      </div>
      
      <div className="flex items-center space-x-2 border border-gray-300 rounded-md p-2">
        <input
          type="checkbox"
          id="includeCarDetails"
          checked={includeCarDetails}
          onChange={(e) => setIncludeCarDetails(e.target.checked)}
          className="h-4 w-4 text-blue-600"
        />
        <label htmlFor="includeCarDetails" className="text-gray-700">
          {translate('Include Car Details')}
        </label>
      </div>
    </div>
    
    <div className="flex">
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
  </div>
);
};

export default ExportToExcel;