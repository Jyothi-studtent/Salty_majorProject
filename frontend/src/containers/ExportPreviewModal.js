// ExportPreviewModal.js
import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const ExportPreviewModal = ({ onClose, onExport }) => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const handleExport = () => {
    onExport(startDate, endDate);
  };

  return (
    <div className="export-preview-modal">
      <div className="modal-content">
        <h2>Select Date Range</h2>
        <div className="date-picker-container">
          <div className="date-picker">
            <label>Start Date:</label>
            <DatePicker selected={startDate} onChange={(date) => setStartDate(date)} />
          </div>
          <div className="date-picker">
            <label>End Date:</label>
            <DatePicker selected={endDate} onChange={(date) => setEndDate(date)} />
          </div>
        </div>
        <div className="modal-buttons">
    <button onClick={handleExport}>Export</button>
    <button onClick={onClose}>Cancel</button>
  </div>
</div>
</div>
  );
};

export default ExportPreviewModal;
