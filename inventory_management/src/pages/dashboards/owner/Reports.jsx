import React, { useState, useEffect, useRef } from 'react';
import { FaFileExport, FaSortAmountDown, FaSortAmountUp, FaSpinner } from 'react-icons/fa';
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
  const [sortConfig, setSortConfig] = useState({
    key: 'HarvestingDate',
    direction: 'desc'
  });
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
  const pdfRef = useRef(null);

  useEffect(() => {
    // Fetch data immediately when component mounts
    fetchInventoryData();
  }, []);

  // Effect for regenerating PDF preview when sort options change
  useEffect(() => {
    if (inventoryData.length > 0) {
      generatePDFPreview();
    }
  }, [inventoryData, sortConfig]);

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

  // Sorting functions
  const sortData = (data, key, direction) => {
    return [...data].sort((a, b) => {
      if (key === 'HarvestingDate') {
        return direction === 'asc' 
          ? new Date(a[key]) - new Date(b[key])
          : new Date(b[key]) - new Date(a[key]);
      }
      if (key === 'QuantityAvailable') {
        return direction === 'asc' 
          ? a[key] - b[key]
          : b[key] - a[key];
      }
      // For strings (CropName, Category)
      return direction === 'asc'
        ? a[key].localeCompare(b[key])
        : b[key].localeCompare(a[key]);
    });
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />;
  };

  // Get sorted inventory data
  const getSortedInventoryData = () => {
    return sortData(inventoryData, sortConfig.key, sortConfig.direction);
  };

  const generatePDF = async () => {
    try {
      console.log('Starting PDF generation...');
      if (!inventoryData || inventoryData.length === 0) {
        console.log('No inventory data available');
        setError('No data available to generate report');
        return null;
      }

      const sortedData = getSortedInventoryData();
      const doc = new jsPDF();
      console.log('Created PDF document');

      // Add header with branding
      doc.setFontSize(24);
      doc.setTextColor(67, 160, 71); // Green color
      doc.text('Reru Estates', 15, 15);

      // Add subtitle
      doc.setFontSize(16);
      doc.setTextColor(0); // Black
      doc.text('Inventory Report', 15, 25);
      
      // Add metadata
      doc.setFontSize(10);
      doc.setTextColor(100); // Gray
      doc.text(`Generated: ${new Date().toLocaleString()}`, 15, 32);
      doc.text(`Sorted by: ${sortConfig.key} (${sortConfig.direction === 'asc' ? 'Ascending' : 'Descending'})`, 15, 37);

      let yOffset = 45;

      if (selectedReports.inventory) {
        console.log('Adding inventory section to PDF');
        
        const headers = [['Crop Name', 'Category', 'Quantity Available', 'Harvesting Date', 'Unit Price']];
        const data = sortedData.map(item => [
          item.CropName || 'N/A',
          item.Category || 'N/A',
          (item.QuantityAvailable || '0').toString(),
          item.HarvestingDate ? new Date(item.HarvestingDate).toLocaleDateString() : 'N/A',
          `Rs. ${parseFloat(item.UnitPrice || 0).toFixed(2)}`
        ]);

        autoTable(doc, {
          startY: yOffset,
          head: headers,
          body: data,
          theme: 'grid',
          styles: { 
            fontSize: 10,
            cellPadding: 3
          },
          headStyles: { 
            fillColor: [67, 160, 71],
            textColor: [255, 255, 255],
            fontStyle: 'bold'
          },
          alternateRowStyles: {
            fillColor: [240, 248, 240]
          }
        });

        yOffset = doc.lastAutoTable.finalY + 15;
        
        // Add summary
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text(`Total Items: ${data.length}`, 15, yOffset);
        
        // Add footer with page numbers
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(8);
        doc.setTextColor(100);
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.text(
            `Page ${i} of ${pageCount}`,
            doc.internal.pageSize.getWidth() / 2,
            doc.internal.pageSize.getHeight() - 10,
            { align: 'center' }
          );
        }
      }

      // For preview, return the doc object
      if (pdfRef.current) {
        return doc;
      }
      
      // For download
      console.log('Saving PDF document...');
      const fileName = `reru-estates-inventory-report-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      console.log('PDF saved successfully');
      return doc;
    } catch (err) {
      console.error('Error generating PDF:', err);
      setError('Failed to generate PDF: ' + err.message);
      return null;
    }
  };

  // Generate PDF preview function
  const generatePDFPreview = async () => {
    try {
      pdfRef.current = true;
      const doc = await generatePDF();
      pdfRef.current = null;
      
      if (doc) {
        // Convert PDF to data URL for preview
        const pdfData = doc.output('datauristring');
        setPdfPreviewUrl(pdfData);
      }
    } catch (err) {
      console.error('Error generating PDF preview:', err);
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

        <div className="sort-options">
          <h4>Sort by:</h4>
          <button
            className={`sort-button ${sortConfig.key === 'CropName' ? 'active' : ''}`}
            onClick={() => handleSort('CropName')}
          >
            Crop Name {getSortIcon('CropName')}
          </button>
          <button
            className={`sort-button ${sortConfig.key === 'Category' ? 'active' : ''}`}
            onClick={() => handleSort('Category')}
          >
            Category {getSortIcon('Category')}
          </button>
          <button
            className={`sort-button ${sortConfig.key === 'QuantityAvailable' ? 'active' : ''}`}
            onClick={() => handleSort('QuantityAvailable')}
          >
            Quantity {getSortIcon('QuantityAvailable')}
          </button>
          <button
            className={`sort-button ${sortConfig.key === 'HarvestingDate' ? 'active' : ''}`}
            onClick={() => handleSort('HarvestingDate')}
          >
            Date {getSortIcon('HarvestingDate')}
          </button>
        </div>

        {inventoryData.length > 0 && (
          <div className="preview-section">
            <h3 className="section-title">Preview</h3>
            
            <div className="table-wrapper">
              <table className="preview-table">
                <thead>
                  <tr>
                    <th>Crop Name</th>
                    <th>Category</th>
                    <th>Quantity</th>
                    <th>Harvesting Date</th>
                    <th>Unit Price</th>
                  </tr>
                </thead>
                <tbody>
                  {getSortedInventoryData().map((item, index) => (
                    <tr key={index}>
                      <td>{item.CropName}</td>
                      <td>{item.Category}</td>
                      <td>{item.QuantityAvailable}</td>
                      <td>{new Date(item.HarvestingDate).toLocaleDateString()}</td>
                      <td>Rs. {parseFloat(item.UnitPrice || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {pdfPreviewUrl && (
              <div className="pdf-preview-container">
                <h4>PDF Preview</h4>
                <iframe 
                  src={pdfPreviewUrl} 
                  className="pdf-preview"
                  title="PDF Preview"
                />
              </div>
            )}
          </div>
        )}

        <div className="action-buttons">
          <button
            className="export-button"
            onClick={() => {
              pdfRef.current = false;
              generatePDF();
            }}
            disabled={loading || !Object.values(selectedReports).some(value => value) || inventoryData.length === 0}
          >
            {loading ? <FaSpinner className="spinner" /> : <FaFileExport />} Download PDF
          </button>
        </div>
      </div>

      {loading && <div className="loading">Loading report data...</div>}
      {error && <div className="error">{error}</div>}
    </div>
  );
};

export default Reports;