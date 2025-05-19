import React, { useState, useEffect } from 'react';
import { FaFileExport } from 'react-icons/fa';
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import './Reports.css';

const Reports = () => {
  const [selectedReports, setSelectedReports] = useState({
    inventory: true  // Set default to true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [inventoryData, setInventoryData] = useState([]);

  useEffect(() => {
    // Fetch data immediately when component mounts
    fetchInventoryData();
  }, []);

  const fetchInventoryData = async () => {
    try {
      console.log('Fetching inventory data...');
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://localhost:5001/api/owner/inventory', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch inventory data: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Received inventory data:', data);
      setInventoryData(data);
    } catch (err) {
      console.error('Error fetching inventory:', err);
      setError(err.message || 'Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (reportType) => {
    setSelectedReports(prev => ({
      ...prev,
      [reportType]: !prev[reportType]
    }));
  };

  const generatePDF = async () => {
    try {
      console.log('Starting PDF generation...');
      if (!inventoryData || inventoryData.length === 0) {
        console.log('No inventory data available');
        setError('No data available to generate report');
        return;
      }

      const doc = new jsPDF();
      console.log('Created PDF document');

      // Add header
      doc.setFontSize(20);
      doc.text('Reru Estates - Reports', 15, 15);
      doc.setFontSize(12);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 15, 25);

      let yOffset = 35;

      if (selectedReports.inventory) {        console.log('Adding inventory section to PDF');
        doc.setFontSize(16);
        doc.text('Inventory Report', 15, yOffset);

        const headers = [['Crop Name', 'Quantity Available', 'Harvesting Date']];
        const data = inventoryData.map(item => [
          item.CropName || 'N/A',
          (item.QuantityAvailable || '0').toString(),
          item.HarvestingDate ? new Date(item.HarvestingDate).toLocaleDateString() : 'N/A'
        ]);

        autoTable(doc, {
          startY: yOffset + 10,
          head: headers,
          body: data,
          theme: 'grid',
          styles: { fontSize: 10 },
          headStyles: { fillColor: [67, 160, 71] }
        });

        yOffset = doc.lastAutoTable.finalY + 20;
      }

      console.log('Saving PDF document...');
      doc.save('reru-estates-reports.pdf');
      console.log('PDF saved successfully');
    } catch (err) {
      console.error('Error generating PDF:', err);
      setError('Failed to generate PDF: ' + err.message);
    }
  };

  return (
    <div className="reports-container">
      <h2 className="reports-header">Generate Reports</h2>

      <div className="reports-options">
        <h3 className="section-title">Select Reports to Export</h3>
        <div className="checkbox-group">
          <label className="checkbox-item">
            <input
              type="checkbox"
              checked={selectedReports.inventory}
              onChange={() => handleCheckboxChange('inventory')}
            />
            Inventory Report
          </label>
        </div>

        <button
          className="export-button"
          onClick={generatePDF}
          disabled={loading || !Object.values(selectedReports).some(value => value)}
        >
          <FaFileExport /> Export as PDF
        </button>
      </div>

      {loading && <div className="loading">Loading report data...</div>}
      {error && <div className="error">{error}</div>}
    </div>
  );
};

export default Reports;