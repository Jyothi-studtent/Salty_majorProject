import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './css/sprintform.css';
import { useNavigate, useParams } from 'react-router-dom';
import { FaTimes } from 'react-icons/fa';

const SprintForm = ({ closeForm, sendDataToParent, initialFormData, closeDropDown, setButtonType, sprintName, onSprintDelete, action }) => {
  const { projectid } = useParams();
  const navigate = useNavigate();
  const today = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState(
    initialFormData || {
      sprint: sprintName,
      sprint_name: sprintName,
      start_date: today,
      end_date: '',
      sprint_goal: '',
      project: projectid,
      status: action,
    }
  );

  const [duration, setDuration] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let startDate = today;
    let endDate = '';

    if (initialFormData) {
      const { start_date, end_date, sprint_name } = initialFormData;
      startDate = start_date || today;
      endDate = end_date || '';
      setFormData((prevFormData) => ({
        ...prevFormData,
        sprint_name: sprint_name || sprintName,
        start_date: startDate,
        end_date: endDate,
      }));
    } else {
      setFormData((prevFormData) => ({
        ...prevFormData,
        sprint_name: sprintName,
        start_date: startDate,
        end_date: endDate,
      }));
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const weeks = diffDays / 7;

      if (weeks === 1) {
        setDuration('1week');
      } else if (weeks === 2) {
        setDuration('2weeks');
      } else if (weeks === 3) {
        setDuration('3weeks');
      } else if (weeks === 4) {
        setDuration('4weeks');
      } else {
        setDuration('customize');
      }
    }
  }, [initialFormData, sprintName, today]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'duration') {
      setDuration(value);
      const startDate = new Date(formData.start_date);
      if (isNaN(startDate.getTime())) {
        return;
      }

      let endDate = new Date(startDate);
      if (value === '1week') {
        endDate.setDate(startDate.getDate() + 7);
      } else if (value === '2weeks') {
        endDate.setDate(startDate.getDate() + 14);
      } else if (value === '3weeks') {
        endDate.setDate(startDate.getDate() + 21);
      } else if (value === '4weeks') {
        endDate.setDate(startDate.getDate() + 28);
      }

      setFormData({
        ...formData,
        end_date: value !== 'customize' ? endDate.toISOString().split('T')[0] : formData.end_date,
      });
    } else if (name === 'start_date') {
      const startDate = new Date(value);
      if (isNaN(startDate.getTime())) {
        return;
      }

      let endDate = new Date(startDate);
      if (duration === '1week') {
        endDate.setDate(startDate.getDate() + 7);
      } else if (duration === '2weeks') {
        endDate.setDate(startDate.getDate() + 14);
      } else if (duration === '3weeks') {
        endDate.setDate(startDate.getDate() + 21);
      } else if (duration === '4weeks') {
        endDate.setDate(startDate.getDate() + 28);
      }

      setFormData({
        ...formData,
        [name]: value,
        end_date: duration !== 'customize' ? endDate.toISOString().split('T')[0] : formData.end_date,
      });
    } else if (name === 'end_date' && duration === 'customize') {
      const endDate = new Date(value);
      const startDate = new Date(formData.start_date);
      if (endDate < startDate) {
        setError('End date cannot be before start date');
        return;
      } else {
        setError('');
      }
      setFormData({
        ...formData,
        [name]: value,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const startDate = new Date(formData.start_date);
    const endDate = new Date(formData.end_date);

    if (endDate < startDate) {
      setError('End date cannot be before start date');
      return;
    }

    try {
      await axios.post('http://localhost:8000/djapp/create_sprint/', formData);
      closeForm(false);
      sendDataToParent(formData);
      // if (action === 'start') {
      //   setButtonType('complete');
      //   navigate(`/project/${projectid}/boards?sprintName=${encodeURIComponent(sprintName)}`);
      // }
      onSprintDelete(true);
    } catch (error) {
      console.error("Error submitting the form:", error);
    }
  };

  const handleClose = () => {
    closeForm(false);
    closeDropDown(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={handleClose}><FaTimes /></button>
        <h2>{initialFormData ? 'Edit Sprint' : 'Create Sprint'}</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="sprintName">Sprint Name:</label>
            <input
              type="text"
              id="sprintName"
              name="sprint_name"
              value={formData.sprint}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label htmlFor="duration">Duration:</label>
            <select
              id="duration"
              name="duration"
              value={duration}
              onChange={handleChange}
              required
            >
              <option value="">Select Duration</option>
              <option value="1week">1 Week</option>
              <option value="2weeks">2 Weeks</option>
              <option value="3weeks">3 Weeks</option>
              <option value="4weeks">4 Weeks</option>
              <option value="customize">Customize</option>
            </select>
          </div>
          <div>
            <label htmlFor="startDate">Start Date:</label>
            <input
              type="date"
              id="startDate"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label htmlFor="endDate">End Date:</label>
            <input
              type="date"
              id="endDate"
              name="end_date"
              value={formData.end_date}
              onChange={handleChange}
              required={duration === 'customize'}
              disabled={duration !== 'customize'}
            />
          </div>
          <div>
            <label htmlFor="goals">Goals:</label>
            <textarea
              id="goals"
              name="sprint_goal"
              value={formData.sprint_goal}
              onChange={handleChange}
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" className="update-btn">{initialFormData ? 'Update Sprint' : 'Start Sprint'}</button>
        </form>
      </div>
    </div>
  );
};

export default SprintForm;


