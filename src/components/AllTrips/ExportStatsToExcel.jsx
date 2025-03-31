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

  const exportToExcel = () => {
    if (!statistics || statistics.length === 0) {
      alert(language === 'arabic' ? 'لا توجد بيانات للتصدير' : 'No data to export');
      return;
    }

    try {
      // Create workbook
      const wb = XLSX.utils.book_new();
      
      // Create summary sheet with all data
      const summaryData = [];
      
      // Add title and date range
      summaryData.push([translate('Statistics Report')]);
      summaryData.push([]);
      summaryData.push([translate('Date Range'), translate('From'), translate('To')]);
      summaryData.push(['', filters?.startDate || '', filters?.endDate || '']);
      summaryData.push([]);
      
      // Add company summary header section
      summaryData.push([translate('Company Summary')]);
      
      // Headers for company summary
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
      
      summaryData.push(companyHeaders);
      
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
        const row = [
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
          row.push(
            company.total_revenue || 0,
            company.total_vat || 0,
            company.total_car_rent || 0,
            (company.total_revenue || 0) + (company.total_vat || 0) + (company.total_car_rent || 0)
          );
          
          companyTotals.totalRevenue += (company.total_revenue || 0);
          companyTotals.totalVAT += (company.total_vat || 0);
          companyTotals.totalCarRent += (company.total_car_rent || 0);
        }
        
        summaryData.push(row);
      });
      
      // Add grand total for companies
      const companyTotalRow = [
        translate('Total'),
        companyTotals.totalTrips,
        companyTotals.totalVolume,
        companyTotals.totalDistance
      ];
      
      if (hasFinancialAccess) {
        const totalAmount = companyTotals.totalRevenue + companyTotals.totalVAT + companyTotals.totalCarRent;
        companyTotalRow.push(
          companyTotals.totalRevenue,
          companyTotals.totalVAT,
          companyTotals.totalCarRent,
          totalAmount
        );
      }
      
      summaryData.push(companyTotalRow);
      summaryData.push([]);
      summaryData.push([]);
      
      // Add detailed sections for each company
      statistics.forEach((company, companyIndex) => {
        if (company.details && company.details.length > 0) {
          // Add company heading
          summaryData.push([`${translateCompanyName(company.company)} ${translate('Details')}`]);
          
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
          
          summaryData.push(detailHeaders);
          
          // Group totals for this company
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
          
          // Add details data
          company.details.forEach(detail => {
            const row = [
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
              row.push(
                detail.fee || 0,
                detail.total_revenue || 0
              );
              
              groupTotals.totalFee += (detail.fee || 0);
              groupTotals.totalRevenue += (detail.total_revenue || 0);
              
              if (hasCarRental) {
                row.push(
                  detail.distinct_cars || 0,
                  detail.distinct_days || 0,
                  detail.car_rental || 0
                );
                
                groupTotals.totalCars += (detail.distinct_cars || 0);
                groupTotals.totalDays += (detail.distinct_days || 0);
                groupTotals.totalCarRental += (detail.car_rental || 0);
              }
              
              if (hasVAT) {
                row.push(detail.vat || 0);
                groupTotals.totalVAT += (detail.vat || 0);
              }
              
              if (hasVAT || hasCarRental) {
                const totalAmount = (detail.total_revenue || 0) + 
                                    (detail.vat || 0) + 
                                    (detail.car_rental || 0);
                                    
                row.push(totalAmount);
                groupTotals.totalAmount += totalAmount;
              }
            }
            
            summaryData.push(row);
          });
          
          // Add total row for this company
          const groupTotalRow = [
            translate('Total'),
            groupTotals.totalTrips,
            groupTotals.totalVolume,
            groupTotals.totalDistance
          ];
          
          if (hasFinancialAccess) {
            groupTotalRow.push(
              groupTotals.totalFee,
              groupTotals.totalRevenue
            );
            
            if (hasCarRental) {
              groupTotalRow.push(
                groupTotals.totalCars,
                groupTotals.totalDays,
                groupTotals.totalCarRental
              );
            }
            
            if (hasVAT) {
              groupTotalRow.push(groupTotals.totalVAT);
            }
            
            if (hasVAT || hasCarRental) {
              groupTotalRow.push(groupTotals.totalAmount);
            }
          }
          
          summaryData.push(groupTotalRow);
          
          // Add empty rows between companies
          if (companyIndex < statistics.length - 1) {
            summaryData.push([]);
            summaryData.push([]);
          }
        }
      });
      
      // Create summary worksheet
      const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
      
      // Add column width settings
      const maxCols = hasFinancialAccess ? 11 : 4;
      const wscols = Array(maxCols).fill({ wch: 15 }); // Default width
      wscols[0] = { wch: 25 }; // Company/Group name column wider
      
      // Apply column widths
      summaryWs['!cols'] = wscols;
      
      // Add the worksheet to the workbook
      XLSX.utils.book_append_sheet(wb, summaryWs, translate('Summary'));
      
      // Try to add some basic formatting using the XLSX package (limited compared to sheetjs)
      // This is a simplified approach for the xlsx package

      // Note: To add proper styling with the xlsx package, you'll need to use the xlsx-style extension 
      // or consider using ExcelJS as an alternative package which offers better styling support
       
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
        <span className={language === 'arabic' ? 'mr-2' : 'ml-2'}>
          {language === 'arabic' ? 'تصدير إلى Excel' : 'Export to Excel'}
        </span>
      </button>
    </div>
  );
};

export default ExportToExcel;