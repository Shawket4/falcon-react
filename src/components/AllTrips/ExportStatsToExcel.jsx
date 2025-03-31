import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Download, Languages } from 'lucide-react';

const ExportToExcel = ({ statistics, hasFinancialAccess }) => {
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

  // Format numbers for display
  const formatNumber = (num) => {
    return new Intl.NumberFormat(language === 'arabic' ? 'ar-EG' : 'en-US', { 
      maximumFractionDigits: 2 
    }).format(num);
  };

  const exportToExcel = () => {
    if (!statistics || statistics.length === 0) {
      alert(language === 'arabic' ? 'لا توجد بيانات للتصدير' : 'No data to export');
      return;
    }

    try {
      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      
      // Summary sheet
      const summaryData = [];
      
      // Add title and date range
      summaryData.push([translate('Statistics Report')]);
      summaryData.push([translate('Date Range'), translate('From'), translate('To')]);
      summaryData.push(['', '', '']); // Placeholder for actual dates
      summaryData.push([]);  // Empty row
      
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
          formatNumber(company.total_trips || 0),
          formatNumber(company.total_volume || 0),
          formatNumber(company.total_distance || 0)
        ];
        
        if (hasFinancialAccess) {
          row.push(
            formatNumber(company.total_revenue || 0),
            formatNumber(company.total_vat || 0),
            formatNumber(company.total_car_rent || 0),
            formatNumber(
              (company.total_revenue || 0) + 
              (company.total_vat || 0) + 
              (company.total_car_rent || 0)
            )
          );
        }
        
        summaryData.push(row);
      });
      
      // Add summary sheet to workbook
      const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, summaryWs, translate('Summary'));
      
      // Create detailed sheets for each company
      statistics.forEach(company => {
        if (company.details && company.details.length > 0) {
          const detailsData = [];
          
          // Add company name as title
          detailsData.push([translateCompanyName(company.company)]);
          detailsData.push([]); // Empty row
          
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
            
            const hasVAT = company.company === "Watanya" || company.company === "TAQA";
            const hasCarRental = company.company === "TAQA";
            
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
              formatNumber(detail.total_trips || 0),
              formatNumber(detail.total_volume || 0),
              formatNumber(detail.total_distance || 0)
            ];
            
            if (hasFinancialAccess) {
              row.push(
                detail.fee ? formatNumber(detail.fee) : '-',
                formatNumber(detail.total_revenue || 0)
              );
              
              const hasVAT = company.company === "Watanya" || company.company === "TAQA";
              const hasCarRental = company.company === "TAQA";
              
              if (hasCarRental) {
                row.push(
                  formatNumber(detail.distinct_cars || 0),
                  formatNumber(detail.distinct_days || 0),
                  formatNumber(detail.car_rental || 0)
                );
              }
              
              if (hasVAT) {
                row.push(formatNumber(detail.vat || 0));
              }
              
              if (hasVAT || hasCarRental) {
                row.push(
                  formatNumber(
                    detail.total_with_vat || 
                    ((detail.total_revenue || 0) + (detail.vat || 0) + (detail.car_rental || 0))
                  )
                );
              }
            }
            
            detailsData.push(row);
          });
          
          // Add detail sheet to workbook
          const detailsWs = XLSX.utils.aoa_to_sheet(detailsData);
          XLSX.utils.book_append_sheet(
            wb, 
            detailsWs, 
            translateCompanyName(company.company).substring(0, 31)
          ); // Excel has a 31 character limit for sheet names
        }
      });
      
      // Export workbook
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
          >
            <option value="english">English</option>
            <option value="arabic">العربية</option>
          </select>
        </div>
      </div>
      
      <button
        onClick={exportToExcel}
        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        <Download className="h-5 w-5" />
        <span>{language === 'arabic' ? 'تصدير إلى Excel' : 'Export to Excel'}</span>
      </button>
    </div>
  );
};

export default ExportToExcel;