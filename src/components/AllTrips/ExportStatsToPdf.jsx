import React, { useState } from 'react';
import { FileText, Languages } from 'lucide-react';

// Alternative approach using HTML and print-to-PDF without encoding issues
const ExportToPDF = ({ statistics, hasFinancialAccess, filters }) => {
  const [language, setLanguage] = useState('english');
  const [isGenerating, setIsGenerating] = useState(false);

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

  // Translation function
  const translate = (text) => {
    if (language === 'arabic') {
      const translations = {
        'Export to PDF': 'تصدير إلى PDF',
        'Generating PDF...': 'جاري إنشاء ملف PDF...',
        'Statistics Report': 'تقرير الإحصائيات',
        'Company': 'الشركة',
        'Group': 'المجموعة',
        'Trips': 'الرحلات',
        'Volume (L)': 'الحجم (لتر)',
        'Distance (km)': 'المسافة (كم)',
        'Base Revenue': 'الإيرادات الأساسية',
        'VAT (14%)': 'ضريبة القيمة المضافة (14٪)',
        'Car Rental Fees': 'رسوم تأجير السيارات',
        'Total Amount': 'المبلغ الإجمالي',
        'Date Range': 'النطاق الزمني',
        'From': 'من',
        'To': 'إلى',
        'Details': 'تفاصيل',
        'Total': 'المجموع',
        'Company Summary': 'ملخص الشركات',
        'Page': 'صفحة',
        'Fee': 'الرسوم',
        'Cars': 'السيارات',
        'Days': 'الأيام'
      };
      return translations[text] || text;
    }
    return text;
  };

  // Translate company name
  const translateCompanyName = (name) => {
    if (language === 'arabic' && companyTranslations[name]) {
      return companyTranslations[name];
    }
    return name;
  };

  // Translate group name
  const translateGroupName = (name) => {
    if (language === 'arabic' && groupTranslations[name]) {
      return groupTranslations[name];
    }
    return name;
  };

  // Format numbers for display
  const formatNumber = (num) => {
    if (num === undefined || num === null) return '0';
    return new Intl.NumberFormat('en-US', { 
      maximumFractionDigits: 2 
    }).format(num);
  };

  // Create a printable HTML page
  const exportToPDF = () => {
    if (!statistics || statistics.length === 0) {
      alert(language === 'arabic' ? 'لا توجد بيانات للتصدير' : 'No data to export');
      return;
    }

    setIsGenerating(true);

    try {
      // Get date range
      const startDate = filters && (filters.startDate || filters.start_date) ? 
          (filters.startDate || filters.start_date) : '';
      const endDate = filters && (filters.endDate || filters.end_date) ? 
          (filters.endDate || filters.end_date) : '';
      
      // Create a new window for the report
      const printWindow = window.open('', '_blank');
      
      // Combine all the HTML content needed
      const htmlContent = `
        <!DOCTYPE html>
        <html lang="${language === 'arabic' ? 'ar' : 'en'}" dir="${language === 'arabic' ? 'rtl' : 'ltr'}">
        <head>
          <meta charset="UTF-8">
          <title>${translate('Statistics Report')}</title>
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
              /* Force each section onto its own page */
              .summary-section {
                page-break-after: always;
              }
              .company-detail-section {
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
            
            .detail-header {
              background-color: #10B981;
              color: white;
            }
            
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
              font-size: 14pt;
            }
            
            th {
              background-color: ${language === 'arabic' ? '#10B981' : '#3B82F6'};
              color: white;
              font-weight: bold;
              padding: 12px 8px;
              text-align: center;
              border: 2px solid #D1D5DB;
            }
            
            .detail-table th {
              background-color: #10B981;
            }
            
            td {
              padding: 10px 8px;
              border: 2px solid #D1D5DB;
              text-align: ${language === 'arabic' ? 'right' : 'left'};
              font-weight: bold;
            }
            
            td.number {
              text-align: center;
            }
            
            tr:nth-child(even) {
              background-color: #F9FAFB;
            }
            
            .total-row {
              background-color: #F3F4F6;
              font-weight: bolder;
            }
            
            .company-name {
              font-weight: bolder;
              ${language === 'arabic' ? 'text-align: right;' : 'text-align: left;'}
            }
          </style>
        </head>
        <body>
          <h1>${translate('Statistics Report')}</h1>
          
          <div class="date-range">
            ${translate('Date Range')}: ${translate('From')} ${startDate} ${translate('To')} ${endDate}
          </div>
          
          <div class="summary-section">
            <h2>${translate('Company Summary')}</h2>
          
            <table>
              <thead>
              <tr>
                <th style="width: 20%;">${translate('Company')}</th>
                <th style="width: 10%;">${translate('Trips')}</th>
                <th style="width: 15%;">${translate('Volume (L)')}</th>
                <th style="width: 15%;">${translate('Distance (km)')}</th>
                ${hasFinancialAccess ? `
                <th style="width: 10%;">${translate('Base Revenue')}</th>
                <th style="width: 10%;">${translate('VAT (14%)')}</th>
                <th style="width: 10%;">${translate('Car Rental Fees')}</th>
                <th style="width: 10%;">${translate('Total Amount')}</th>
                ` : ''}
              </tr>
            </thead>
            <tbody>
      `;
      
      // Calculate totals
      let totalTrips = 0;
      let totalVolume = 0;
      let totalDistance = 0;
      let totalRevenue = 0;
      let totalVAT = 0;
      let totalCarRent = 0;
      
      // Add company rows
      let companiesHTML = '';
      
      statistics.forEach((company, index) => {
        // Update totals
        totalTrips += (company.total_trips || 0);
        totalVolume += (company.total_volume || 0);
        totalDistance += (company.total_distance || 0);
        totalRevenue += (company.total_revenue || 0);
        totalVAT += (company.total_vat || 0);
        totalCarRent += (company.total_car_rent || 0);
        
        // Calculate company total
        const companyTotal = (company.total_revenue || 0) + (company.total_vat || 0) + (company.total_car_rent || 0);
        
        companiesHTML += `
          <tr>
            <td class="company-name">${translateCompanyName(company.company)}</td>
            <td class="number">${formatNumber(company.total_trips || 0)}</td>
            <td class="number">${formatNumber(company.total_volume || 0)}</td>
            <td class="number">${formatNumber(company.total_distance || 0)}</td>
            ${hasFinancialAccess ? `
            <td class="number">$${formatNumber(company.total_revenue || 0)}</td>
            <td class="number">$${formatNumber(company.total_vat || 0)}</td>
            <td class="number">$${formatNumber(company.total_car_rent || 0)}</td>
            <td class="number">$${formatNumber(companyTotal)}</td>
            ` : ''}
          </tr>
        `;
      });
      
      // Add total row
      const totalAmount = totalRevenue + totalVAT + totalCarRent;
      
      companiesHTML += `
          <tr class="total-row">
            <td>${translate('Total')}</td>
            <td class="number">${formatNumber(totalTrips)}</td>
            <td class="number">${formatNumber(totalVolume)}</td>
            <td class="number">${formatNumber(totalDistance)}</td>
            ${hasFinancialAccess ? `
            <td class="number">$${formatNumber(totalRevenue)}</td>
            <td class="number">$${formatNumber(totalVAT)}</td>
            <td class="number">$${formatNumber(totalCarRent)}</td>
            <td class="number">$${formatNumber(totalAmount)}</td>
            ` : ''}
          </tr>
        </tbody>
      </table>
      </div>
      `;
      
      // Company details
      let detailsHTML = '';
      
      statistics.forEach(company => {
        if (company.details && company.details.length > 0) {
          // Determine which columns to include
          const hasVAT = company.company === "Watanya" || company.company === "TAQA";
          const hasCarRental = company.company === "TAQA";
          
          // Calculate group totals
          let groupTotalTrips = 0;
          let groupTotalVolume = 0;
          let groupTotalDistance = 0;
          let groupTotalRevenue = 0;
          let groupTotalVAT = 0;
          let groupTotalCarRental = 0;
          
          company.details.forEach(detail => {
            groupTotalTrips += (detail.total_trips || 0);
            groupTotalVolume += (detail.total_volume || 0);
            groupTotalDistance += (detail.total_distance || 0);
            groupTotalRevenue += (detail.total_revenue || 0);
            groupTotalVAT += (detail.vat || 0);
            groupTotalCarRental += (detail.car_rental || 0);
          });
          
          detailsHTML += `
            <div class="company-detail-section">
              <h2>${translateCompanyName(company.company)} ${translate('Details')}</h2>
              
              <table class="detail-table">
                <thead>
                  <tr>
                    <th style="width: 20%;">${translate('Group')}</th>
                    <th style="width: 10%;">${translate('Trips')}</th>
                    <th style="width: 15%;">${translate('Volume (L)')}</th>
                    <th style="width: 15%;">${translate('Distance (km)')}</th>
                    ${hasFinancialAccess ? `
                    <th style="width: 10%;">${translate('Base Revenue')}</th>
                    ${hasVAT ? `<th style="width: 10%;">${translate('VAT (14%)')}</th>` : ''}
                    ${hasCarRental ? `<th style="width: 10%;">${translate('Car Rental Fees')}</th>` : ''}
                    ${(hasVAT || hasCarRental) ? `<th style="width: 10%;">${translate('Total Amount')}</th>` : ''}
                    ` : ''}
                  </tr>
                </thead>
                <tbody>
          `;
          
          // Add detail rows
          company.details.forEach(detail => {
            // Calculate row total
            const rowTotal = (detail.total_revenue || 0) + (detail.vat || 0) + (detail.car_rental || 0);
            
            detailsHTML += `
              <tr>
                <td class="company-name">${translateGroupName(detail.group_name)}</td>
                <td class="number">${formatNumber(detail.total_trips || 0)}</td>
                <td class="number">${formatNumber(detail.total_volume || 0)}</td>
                <td class="number">${formatNumber(detail.total_distance || 0)}</td>
                ${hasFinancialAccess ? `
                <td class="number">$${formatNumber(detail.total_revenue || 0)}</td>
                ${hasVAT ? `<td class="number">$${formatNumber(detail.vat || 0)}</td>` : ''}
                ${hasCarRental ? `<td class="number">$${formatNumber(detail.car_rental || 0)}</td>` : ''}
                ${(hasVAT || hasCarRental) ? `<td class="number">$${formatNumber(rowTotal)}</td>` : ''}
                ` : ''}
              </tr>
            `;
          });
          
          // Add group total row
          const groupTotal = groupTotalRevenue + groupTotalVAT + groupTotalCarRental;
          
          detailsHTML += `
                <tr class="total-row">
                  <td>${translate('Total')}</td>
                  <td class="number">${formatNumber(groupTotalTrips)}</td>
                  <td class="number">${formatNumber(groupTotalVolume)}</td>
                  <td class="number">${formatNumber(groupTotalDistance)}</td>
                  ${hasFinancialAccess ? `
                  <td class="number">$${formatNumber(groupTotalRevenue)}</td>
                  ${hasVAT ? `<td class="number">$${formatNumber(groupTotalVAT)}</td>` : ''}
                  ${hasCarRental ? `<td class="number">$${formatNumber(groupTotalCarRental)}</td>` : ''}
                  ${(hasVAT || hasCarRental) ? `<td class="number">$${formatNumber(groupTotal)}</td>` : ''}
                  ` : ''}
                </tr>
              </tbody>
            </table>
          </div>
          `;
        }
      });
      
      // Combine all content
      const finalHtml = htmlContent + companiesHTML + detailsHTML + `
          <script>
            // Add page numbers
            let addPageNumbers = function() {
              // Get all the pages
              var pages = document.querySelectorAll('.summary-section, .company-detail-section');
              
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
      printWindow.document.write(finalHtml);
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

export default ExportToPDF;