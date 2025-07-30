import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, ScatterChart, Scatter } from 'recharts';
import { AlertTriangle, Car, TrendingUp, Clock, MapPin, Download, Filter, Search, RefreshCw, Eye, X, Calendar, BarChart3, PieChart as PieChartIcon, Activity, FileText } from 'lucide-react';
import apiClient from '../../apiClient';

const SpeedViolations = () => {
  const [violations, setViolations] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [filterExceedsBy, setFilterExceedsBy] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [viewMode, setViewMode] = useState('overview');

  useEffect(() => {
    fetchViolations();
  }, []);

  const fetchViolations = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await apiClient.get('/api/GetVehicleSpeedViolations');
      setViolations(response.data);
    } catch (err) {
      setError('Failed to fetch speed violations');
      console.error('Error fetching violations:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      if (timestamp.includes('/') && timestamp.includes(':')) {
        const parts = timestamp.split(' ');
        if (parts.length === 2) {
          const datePart = parts[0];
          const timePart = parts[1];
          
          const dateParts = datePart.split('/');
          if (dateParts.length === 3) {
            const day = parseInt(dateParts[0], 10);
            const month = parseInt(dateParts[1], 10) - 1;
            const year = parseInt(dateParts[2], 10);
            
            const timeParts = timePart.split(':');
            if (timeParts.length === 3) {
              const hour = parseInt(timeParts[0], 10);
              const minute = parseInt(timeParts[1], 10);
              const second = parseInt(timeParts[2], 10);
              
              const date = new Date(year, month, day, hour, minute, second);
              return date.toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              });
            }
          }
        }
      }
      
      const date = new Date(timestamp);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (err) {
      return timestamp;
    }
  };

  const formatSpeed = (speed) => {
    return `${speed} km/h`;
  };

  const getExceedsByColor = (exceedsBy) => {
    if (exceedsBy <= 10) return 'text-green-600 bg-green-100';
    if (exceedsBy <= 20) return 'text-yellow-600 bg-yellow-100';
    if (exceedsBy <= 30) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getSeverityColor = (exceedsBy) => {
    if (exceedsBy <= 10) return '#10b981';
    if (exceedsBy <= 20) return '#f59e0b';
    if (exceedsBy <= 30) return '#f97316';
    return '#ef4444';
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Data processing for charts
  const getTimeSeriesData = () => {
    const allViolations = Object.entries(violations).flatMap(([plate, vehicleViolations]) =>
      vehicleViolations.map(v => ({ ...v, plate }))
    );
    
    const groupedByDate = allViolations.reduce((acc, violation) => {
      const date = violation.Timestamp.split(' ')[0];
      if (!acc[date]) {
        acc[date] = { date, count: 0, avgSpeed: 0, avgExceedsBy: 0, speeds: [], exceedsBys: [] };
      }
      acc[date].count++;
      acc[date].speeds.push(violation.Speed);
      acc[date].exceedsBys.push(violation.ExceedsBy);
      return acc;
    }, {});

    return Object.values(groupedByDate).map(item => ({
      ...item,
      avgSpeed: Math.round(item.speeds.reduce((a, b) => a + b, 0) / item.speeds.length),
      avgExceedsBy: Math.round(item.exceedsBys.reduce((a, b) => a + b, 0) / item.exceedsBys.length)
    })).sort((a, b) => new Date(a.date.split('/').reverse().join('-')) - new Date(b.date.split('/').reverse().join('-')));
  };

  const getSeverityDistribution = () => {
    const allViolations = Object.values(violations).flat();
    const distribution = {
      'Low (≤10 km/h)': 0,
      'Medium (11-20 km/h)': 0,
      'High (21-30 km/h)': 0,
      'Critical (>30 km/h)': 0
    };

    allViolations.forEach(v => {
      if (v.ExceedsBy <= 10) distribution['Low (≤10 km/h)']++;
      else if (v.ExceedsBy <= 20) distribution['Medium (11-20 km/h)']++;
      else if (v.ExceedsBy <= 30) distribution['High (21-30 km/h)']++;
      else distribution['Critical (>30 km/h)']++;
    });

    return Object.entries(distribution).map(([name, value]) => ({ name, value }));
  };

  const getVehicleRankingData = () => {
    return Object.entries(violations).map(([plate, vehicleViolations]) => ({
      plate,
      count: vehicleViolations.length,
      maxSpeed: Math.max(...vehicleViolations.map(v => v.Speed)),
      avgExceedsBy: Math.round(vehicleViolations.reduce((sum, v) => sum + v.ExceedsBy, 0) / vehicleViolations.length),
      maxExceedsBy: Math.max(...vehicleViolations.map(v => v.ExceedsBy))
    })).sort((a, b) => b.count - a.count).slice(0, 10);
  };

  const getHourlyDistribution = () => {
    const allViolations = Object.values(violations).flat();
    const hourlyData = Array.from({ length: 24 }, (_, i) => ({ hour: i, count: 0 }));
    
    allViolations.forEach(violation => {
      const hour = parseInt(violation.Timestamp.split(' ')[1].split(':')[0]);
      hourlyData[hour].count++;
    });

    return hourlyData;
  };

  const getSortedViolations = () => {
    const vehicleEntries = Object.entries(violations);
    
    if (!sortConfig.key) return vehicleEntries;

    return vehicleEntries.sort(([plateA, violationsA], [plateB, violationsB]) => {
      let a, b;
      
      switch (sortConfig.key) {
        case 'plate':
          a = plateA;
          b = plateB;
          break;
        case 'count':
          a = violationsA.length;
          b = violationsB.length;
          break;
        case 'maxSpeed':
          a = Math.max(...violationsA.map(v => v.Speed));
          b = Math.max(...violationsB.map(v => v.Speed));
          break;
        case 'maxExceedsBy':
          a = Math.max(...violationsA.map(v => v.ExceedsBy));
          b = Math.max(...violationsB.map(v => v.ExceedsBy));
          break;
        default:
          return 0;
      }

      if (sortConfig.direction === 'asc') {
        return a > b ? 1 : -1;
      } else {
        return a < b ? 1 : -1;
      }
    });
  };

  const getFilteredViolations = () => {
    let filtered = getSortedViolations();
    
    if (searchTerm) {
      filtered = filtered.filter(([plate]) => 
        plate.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterExceedsBy !== 'all') {
      filtered = filtered.filter(([plate, violations]) => {
        const maxExceedsBy = Math.max(...violations.map(v => v.ExceedsBy));
        switch (filterExceedsBy) {
          case 'low':
            return maxExceedsBy <= 10;
          case 'medium':
            return maxExceedsBy > 10 && maxExceedsBy <= 20;
          case 'high':
            return maxExceedsBy > 20 && maxExceedsBy <= 30;
          case 'critical':
            return maxExceedsBy > 30;
          default:
            return true;
        }
      });
    }

    return filtered;
  };

  const getTotalViolations = () => {
    return Object.values(violations).reduce((total, vehicleViolations) => 
      total + vehicleViolations.length, 0
    );
  };

  const getTotalVehicles = () => {
    return Object.keys(violations).length;
  };

  const getAverageExceedsBy = () => {
    const allViolations = Object.values(violations).flat();
    if (allViolations.length === 0) return 0;
    const total = allViolations.reduce((sum, v) => sum + v.ExceedsBy, 0);
    return Math.round(total / allViolations.length);
  };

  const getHighestSpeed = () => {
    const allViolations = Object.values(violations).flat();
    if (allViolations.length === 0) return 0;
    return Math.max(...allViolations.map(v => v.Speed));
  };

  // Export functions
  const generatePDFReport = () => {
    const allViolations = Object.values(violations).flat();
    const severityData = getSeverityDistribution();
    const vehicleRankingData = getVehicleRankingData();
    
    // Create HTML content for PDF
    const reportContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Speed Violations Report</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 20px;
            background: white;
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #3b82f6;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #1f2937;
            margin: 0;
            font-size: 28px;
            font-weight: bold;
          }
          .header p {
            color: #6b7280;
            margin: 5px 0 0 0;
            font-size: 14px;
          }
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
            margin-bottom: 30px;
          }
          .stat-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
          }
          .stat-number {
            font-size: 24px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 5px;
          }
          .stat-label {
            color: #6b7280;
            font-size: 12px;
            text-transform: uppercase;
            font-weight: 500;
          }
          .section {
            margin-bottom: 30px;
            page-break-inside: avoid;
          }
          .section-title {
            font-size: 18px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 15px;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 5px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            font-size: 12px;
          }
          th, td {
            border: 1px solid #e5e7eb;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f9fafb;
            font-weight: 600;
            color: #374151;
          }
          tr:nth-child(even) {
            background-color: #f9fafb;
          }
          .severity-low { background-color: #dcfce7; color: #166534; }
          .severity-medium { background-color: #fef3c7; color: #92400e; }
          .severity-high { background-color: #fed7aa; color: #9a3412; }
          .severity-critical { background-color: #fecaca; color: #991b1b; }
          .two-column {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 12px;
          }
          @media print {
            body { margin: 0; padding: 15px; }
            .stats-grid { grid-template-columns: repeat(2, 1fr); }
            .two-column { grid-template-columns: 1fr; gap: 20px; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Speed Violations Report</h1>
          <p>Generated on ${new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</p>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-number">${getTotalViolations().toLocaleString()}</div>
            <div class="stat-label">Total Violations</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${getTotalVehicles()}</div>
            <div class="stat-label">Vehicles Involved</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${getAverageExceedsBy()} km/h</div>
            <div class="stat-label">Avg. Exceeds By</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${getHighestSpeed()} km/h</div>
            <div class="stat-label">Highest Speed</div>
          </div>
        </div>

        <div class="two-column">
          <div class="section">
            <h2 class="section-title">Severity Distribution</h2>
            <table>
              <thead>
                <tr>
                  <th>Severity Level</th>
                  <th>Count</th>
                  <th>Percentage</th>
                </tr>
              </thead>
              <tbody>
                ${severityData.map(item => {
                  const percentage = ((item.value / getTotalViolations()) * 100).toFixed(1);
                  const severityClass = item.name.includes('Low') ? 'severity-low' : 
                                       item.name.includes('Medium') ? 'severity-medium' :
                                       item.name.includes('High') ? 'severity-high' : 'severity-critical';
                  return `
                    <tr class="${severityClass}">
                      <td>${item.name}</td>
                      <td>${item.value}</td>
                      <td>${percentage}%</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>

          <div class="section">
            <h2 class="section-title">Top 10 Violating Vehicles</h2>
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Vehicle Plate</th>
                  <th>Violations</th>
                  <th>Max Speed</th>
                  <th>Max Exceeds By</th>
                </tr>
              </thead>
              <tbody>
                ${vehicleRankingData.slice(0, 10).map((vehicle, index) => `
                  <tr>
                    <td>${index + 1}</td>
                    <td><strong>${vehicle.plate}</strong></td>
                    <td>${vehicle.count}</td>
                    <td>${vehicle.maxSpeed} km/h</td>
                    <td>+${vehicle.maxExceedsBy} km/h</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <div class="section">
          <h2 class="section-title">All Vehicle Violations Summary</h2>
          <table>
            <thead>
              <tr>
                <th>Vehicle Plate</th>
                <th>Total Violations</th>
                <th>Max Speed (km/h)</th>
                <th>Avg Speed (km/h)</th>
                <th>Max Exceeds By (km/h)</th>
                <th>Avg Exceeds By (km/h)</th>
                <th>Risk Level</th>
              </tr>
            </thead>
            <tbody>
              ${Object.entries(violations).map(([plate, vehicleViolations]) => {
                const maxSpeed = Math.max(...vehicleViolations.map(v => v.Speed));
                const avgSpeed = Math.round(vehicleViolations.reduce((sum, v) => sum + v.Speed, 0) / vehicleViolations.length);
                const maxExceedsBy = Math.max(...vehicleViolations.map(v => v.ExceedsBy));
                const avgExceedsBy = Math.round(vehicleViolations.reduce((sum, v) => sum + v.ExceedsBy, 0) / vehicleViolations.length);
                const riskLevel = maxExceedsBy <= 10 ? 'Low' : maxExceedsBy <= 20 ? 'Medium' : maxExceedsBy <= 30 ? 'High' : 'Critical';
                const riskClass = maxExceedsBy <= 10 ? 'severity-low' : maxExceedsBy <= 20 ? 'severity-medium' : maxExceedsBy <= 30 ? 'severity-high' : 'severity-critical';
                
                return `
                  <tr>
                    <td><strong>${plate}</strong></td>
                    <td>${vehicleViolations.length}</td>
                    <td>${maxSpeed}</td>
                    <td>${avgSpeed}</td>
                    <td>${maxExceedsBy}</td>
                    <td>${avgExceedsBy}</td>
                    <td><span class="${riskClass}">${riskLevel}</span></td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2 class="section-title">Detailed Violations Log</h2>
          <table>
            <thead>
              <tr>
                <th>Vehicle Plate</th>
                <th>Date & Time</th>
                <th>Speed (km/h)</th>
                <th>Exceeds By (km/h)</th>
                <th>Severity</th>
                <th>Location</th>
              </tr>
            </thead>
            <tbody>
              ${allViolations
                .sort((a, b) => new Date(b.Timestamp.split('/').reverse().join('-')) - new Date(a.Timestamp.split('/').reverse().join('-')))
                .map(violation => {
                  const plate = Object.keys(violations).find(key => violations[key].includes(violation));
                  const severity = violation.ExceedsBy <= 10 ? 'Low' : violation.ExceedsBy <= 20 ? 'Medium' : violation.ExceedsBy <= 30 ? 'High' : 'Critical';
                  const severityClass = violation.ExceedsBy <= 10 ? 'severity-low' : violation.ExceedsBy <= 20 ? 'severity-medium' : violation.ExceedsBy <= 30 ? 'severity-high' : 'severity-critical';
                  
                  return `
                    <tr>
                      <td><strong>${plate}</strong></td>
                      <td>${formatDate(violation.Timestamp)}</td>
                      <td>${violation.Speed}</td>
                      <td>+${violation.ExceedsBy}</td>
                      <td><span class="${severityClass}">${severity}</span></td>
                      <td>${violation.Latitude && violation.Longitude ? `${violation.Latitude}, ${violation.Longitude}` : 'N/A'}</td>
                    </tr>
                  `;
                }).join('')}
            </tbody>
          </table>
        </div>

        <div class="footer">
          <p>This report contains ${getTotalViolations()} speed violations across ${getTotalVehicles()} vehicles.</p>
          <p>Report generated by Speed Violations Dashboard System</p>
        </div>
      </body>
      </html>
    `;

    // Create and download PDF
    const printWindow = window.open('', '_blank');
    printWindow.document.write(reportContent);
    printWindow.document.close();
    
    // Wait for content to load, then print
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 1000);
  };

  const exportToCSV = () => {
    const allViolations = Object.values(violations).flat();
    const csvData = [
      ['Vehicle Plate', 'Date & Time', 'Speed (km/h)', 'Exceeds By (km/h)', 'Severity', 'Latitude', 'Longitude'],
      ...allViolations.map(violation => {
        const plate = Object.keys(violations).find(key => violations[key].includes(violation));
        const severity = violation.ExceedsBy <= 10 ? 'Low' : violation.ExceedsBy <= 20 ? 'Medium' : violation.ExceedsBy <= 30 ? 'High' : 'Critical';
        
        return [
          plate,
          formatDate(violation.Timestamp),
          violation.Speed,
          violation.ExceedsBy,
          severity,
          violation.Latitude || 'N/A',
          violation.Longitude || 'N/A'
        ];
      })
    ];

    const csvContent = csvData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `speed_violations_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateVehicleReport = (vehicleData) => {
    const { plate, violations: vehicleViolations } = vehicleData;
    
    const reportContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Vehicle Report - ${plate}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 20px;
            background: white;
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #3b82f6;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #1f2937;
            margin: 0;
            font-size: 28px;
            font-weight: bold;
          }
          .vehicle-plate {
            background: #3b82f6;
            color: white;
            padding: 8px 16px;
            border-radius: 8px;
            display: inline-block;
            font-weight: bold;
            font-size: 18px;
            margin: 10px 0;
          }
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
            margin-bottom: 30px;
          }
          .stat-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
          }
          .stat-number {
            font-size: 24px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 5px;
          }
          .stat-label {
            color: #6b7280;
            font-size: 12px;
            text-transform: uppercase;
            font-weight: 500;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            font-size: 12px;
          }
          th, td {
            border: 1px solid #e5e7eb;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f9fafb;
            font-weight: 600;
            color: #374151;
          }
          tr:nth-child(even) {
            background-color: #f9fafb;
          }
          .severity-low { background-color: #dcfce7; color: #166534; }
          .severity-medium { background-color: #fef3c7; color: #92400e; }
          .severity-high { background-color: #fed7aa; color: #9a3412; }
          .severity-critical { background-color: #fecaca; color: #991b1b; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Vehicle Violation Report</h1>
          <div class="vehicle-plate">${plate}</div>
          <p>Generated on ${new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</p>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-number">${vehicleViolations.length}</div>
            <div class="stat-label">Total Violations</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${Math.max(...vehicleViolations.map(v => v.Speed))} km/h</div>
            <div class="stat-label">Max Speed</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${Math.max(...vehicleViolations.map(v => v.ExceedsBy))} km/h</div>
            <div class="stat-label">Max Exceeds By</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${Math.round(vehicleViolations.reduce((sum, v) => sum + v.ExceedsBy, 0) / vehicleViolations.length)} km/h</div>
            <div class="stat-label">Avg Exceeds By</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Date & Time</th>
              <th>Speed (km/h)</th>
              <th>Exceeds By (km/h)</th>
              <th>Severity</th>
              <th>Location</th>
            </tr>
          </thead>
          <tbody>
            ${vehicleViolations.map(violation => {
              const severity = violation.ExceedsBy <= 10 ? 'Low' : violation.ExceedsBy <= 20 ? 'Medium' : violation.ExceedsBy <= 30 ? 'High' : 'Critical';
              const severityClass = violation.ExceedsBy <= 10 ? 'severity-low' : violation.ExceedsBy <= 20 ? 'severity-medium' : violation.ExceedsBy <= 30 ? 'severity-high' : 'severity-critical';
              
              return `
                <tr>
                  <td>${formatDate(violation.Timestamp)}</td>
                  <td>${violation.Speed}</td>
                  <td>+${violation.ExceedsBy}</td>
                  <td><span class="${severityClass}">${severity}</span></td>
                  <td>${violation.Latitude && violation.Longitude ? `${violation.Latitude}, ${violation.Longitude}` : 'N/A'}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(reportContent);
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 1000);
  };

  const SortableHeader = ({ label, field, className = '' }) => (
    <th 
      className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50 transition-colors ${className}`}
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center">
        {label}
        {sortConfig.key === field && (
          <span className="ml-1">
            {sortConfig.direction === 'asc' ? '↑' : '↓'}
          </span>
        )}
      </div>
    </th>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading speed violations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-lg shadow-sm">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-6 w-6 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-red-800">Error Loading Data</h3>
              <p className="mt-2 text-sm text-red-700">{error}</p>
              <button
                onClick={fetchViolations}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-800 bg-red-100 hover:bg-red-200 transition-colors"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const filteredViolations = getFilteredViolations();
  const timeSeriesData = getTimeSeriesData();
  const severityData = getSeverityDistribution();
  const vehicleRankingData = getVehicleRankingData();
  const hourlyData = getHourlyDistribution();

  const COLORS = ['#10b981', '#f59e0b', '#f97316', '#ef4444'];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Speed Violations Dashboard</h1>
              <p className="text-gray-600">Real-time monitoring and analysis of vehicle speed violations</p>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <button
                onClick={fetchViolations}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              
              {/* Export Dropdown */}
              <div className="relative group">
                <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                  <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                  <div className="py-1">
                    <button
                      onClick={generatePDFReport}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <FileText className="h-4 w-4 mr-3" />
                      PDF Report
                    </button>
                    <button
                      onClick={exportToCSV}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <Download className="h-4 w-4 mr-3" />
                      CSV Export
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'charts', label: 'Analytics', icon: Activity },
                { id: 'table', label: 'Vehicle List', icon: Car }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setViewMode(id)}
                  className={`group inline-flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    viewMode === id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                </div>
                <div className="ml-4 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Violations</dt>
                    <dd className="text-2xl font-bold text-gray-900">{getTotalViolations().toLocaleString()}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Car className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="ml-4 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Vehicles Involved</dt>
                    <dd className="text-2xl font-bold text-gray-900">{getTotalVehicles()}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
                <div className="ml-4 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Avg. Exceeds By</dt>
                    <dd className="text-2xl font-bold text-gray-900">{getAverageExceedsBy()} km/h</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Clock className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div className="ml-4 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Highest Speed</dt>
                    <dd className="text-2xl font-bold text-gray-900">{getHighestSpeed()} km/h</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content based on view mode */}
        {viewMode === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Severity Distribution */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Violation Severity Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={severityData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {severityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Top Violating Vehicles */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Violating Vehicles</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={vehicleRankingData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="plate" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {viewMode === 'charts' && (
          <div className="space-y-8">
            {/* Time Series */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Violations Over Time</h3>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="count" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Hourly Distribution */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Violations by Hour of Day</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Speed vs Exceeds By Scatter */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Speed vs Exceeds By Analysis</h3>
              <ResponsiveContainer width="100%" height={400}>
                <ScatterChart data={Object.values(violations).flat()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="Speed" name="Speed" unit="km/h" />
                  <YAxis dataKey="ExceedsBy" name="Exceeds By" unit="km/h" />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Scatter name="Violations" data={Object.values(violations).flat()} fill="#8884d8" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {viewMode === 'table' && (
          <>
            {/* Filters */}
            <div className="bg-white shadow-lg rounded-xl mb-6 border border-gray-100">
              <div className="px-6 py-5">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Search className="h-4 w-4 inline mr-1" />
                      Search Vehicle
                    </label>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Enter plate number..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Filter className="h-4 w-4 inline mr-1" />
                      Severity Filter
                    </label>
                    <select
                      value={filterExceedsBy}
                      onChange={(e) => setFilterExceedsBy(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <option value="all">All Severities</option>
                      <option value="low">Low (≤10 km/h)</option>
                      <option value="medium">Medium (11-20 km/h)</option>
                      <option value="high">High (21-30 km/h)</option>
                      <option value="critical">Critical (30 km/h)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="h-4 w-4 inline mr-1" />
                      Date Range
                    </label>
                    <select
                      value={dateRange}
                      onChange={(e) => setDateRange(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <option value="all">All Time</option>
                      <option value="today">Today</option>
                      <option value="week">This Week</option>
                      <option value="month">This Month</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setFilterExceedsBy('all');
                        setDateRange('all');
                      }}
                      className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Violations Table */}
            <div className="bg-white shadow-lg overflow-hidden rounded-xl border border-gray-100">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-semibold text-gray-900">
                  Vehicle Speed Violations ({filteredViolations.length} vehicles)
                </h3>
              </div>
              
              {filteredViolations.length === 0 ? (
                <div className="text-center py-16">
                  <Car className="mx-auto h-16 w-16 text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No violations found</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    {searchTerm || filterExceedsBy !== 'all' 
                      ? 'Try adjusting your search or filter criteria.'
                      : 'No speed violations have been recorded.'
                    }
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <SortableHeader label="Vehicle Plate" field="plate" />
                        <SortableHeader label="Violations Count" field="count" />
                        <SortableHeader label="Max Speed" field="maxSpeed" />
                        <SortableHeader label="Max Exceeds By" field="maxExceedsBy" />
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Risk Level
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredViolations.map(([plate, vehicleViolations]) => {
                        const maxSpeed = Math.max(...vehicleViolations.map(v => v.Speed));
                        const maxExceedsBy = Math.max(...vehicleViolations.map(v => v.ExceedsBy));
                        const violationCount = vehicleViolations.length;
                        const avgExceedsBy = Math.round(vehicleViolations.reduce((sum, v) => sum + v.ExceedsBy, 0) / vehicleViolations.length);
                        
                        return (
                          <tr key={plate} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{plate}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                {violationCount}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                              {formatSpeed(maxSpeed)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getExceedsByColor(maxExceedsBy)}`}>
                                +{maxExceedsBy} km/h
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className={`w-3 h-3 rounded-full mr-2`} style={{backgroundColor: getSeverityColor(maxExceedsBy)}}></div>
                                <span className="text-sm text-gray-900">
                                  {maxExceedsBy <= 10 ? 'Low' : maxExceedsBy <= 20 ? 'Medium' : maxExceedsBy <= 30 ? 'High' : 'Critical'}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => setSelectedVehicle({ plate, violations: vehicleViolations })}
                                className="inline-flex items-center text-blue-600 hover:text-blue-900 transition-colors"
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View Details
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* Vehicle Details Modal */}
        {selectedVehicle && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Violations for {selectedVehicle.plate}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedVehicle.violations.length} violations recorded
                  </p>
                </div>
                <button
                  onClick={() => setSelectedVehicle(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              {/* Modal Stats */}
              <div className="p-6 border-b border-gray-200 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {selectedVehicle.violations.length}
                    </div>
                    <div className="text-sm text-gray-500">Total Violations</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {Math.max(...selectedVehicle.violations.map(v => v.Speed))} km/h
                    </div>
                    <div className="text-sm text-gray-500">Max Speed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {Math.max(...selectedVehicle.violations.map(v => v.ExceedsBy))} km/h
                    </div>
                    <div className="text-sm text-gray-500">Max Exceeds By</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {Math.round(selectedVehicle.violations.reduce((sum, v) => sum + v.ExceedsBy, 0) / selectedVehicle.violations.length)} km/h
                    </div>
                    <div className="text-sm text-gray-500">Avg Exceeds By</div>
                  </div>
                </div>
              </div>

              <div className="overflow-y-auto max-h-96 p-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date & Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Speed
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Exceeds By
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Severity
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Location
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedVehicle.violations.map((violation, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(violation.Timestamp)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {formatSpeed(violation.Speed)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getExceedsByColor(violation.ExceedsBy)}`}>
                              +{violation.ExceedsBy} km/h
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className={`w-2 h-2 rounded-full mr-2`} style={{backgroundColor: getSeverityColor(violation.ExceedsBy)}}></div>
                              <span className="text-sm text-gray-900">
                                {violation.ExceedsBy <= 10 ? 'Low' : violation.ExceedsBy <= 20 ? 'Medium' : violation.ExceedsBy <= 30 ? 'High' : 'Critical'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {violation.Latitude && violation.Longitude 
                              ? (
                                <a
                                  href={`https://www.google.com/maps?q=${violation.Latitude},${violation.Longitude}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                                >
                                  <MapPin className="h-4 w-4 mr-1" />
                                  View on Map
                                </a>
                              )
                              : (
                                <span className="text-gray-400">N/A</span>
                              )
                            }
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedVehicle(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button 
                  onClick={() => generateVehicleReport(selectedVehicle)}
                  className="px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  Generate Report
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpeedViolations;