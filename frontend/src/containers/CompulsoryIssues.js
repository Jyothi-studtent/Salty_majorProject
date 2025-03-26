import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import './css/compIssues.css';
import FileComp from './FileComp';

export default function CompulsoryIssues() {
  const { group_id } = useParams();
  const user = useSelector((state) => state.auth.user); // Get user from Redux state
  const [showForm, setShowForm] = useState(false); // State to control form visibility
  const [formData, setFormData] = useState({
    issue_name: '',
    story_points: 1,
    description: '',
    priority: 'Medium',
    deadline: '',
  });

  // Function to toggle form visibility
  const toggleForm = () => {
    setShowForm(!showForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!formData.issue_name || !formData.description) {
      alert('Issue Name and Description are required.');
      return;
    }
  
    try {
      const response = await axios.get('http://localhost:8000/djapp/project_list/', {
        params: { email: user.email, group_id: group_id },
      });
  
      let projects = [];
      if (response.status === 200) {
        projects = response.data;
        console.log('Projects fetched:', projects);
      }
  
      const projectIds = projects.map((project) => project.projectid);
  
      const payload = {
        issue_name: formData.issue_name,
        description: formData.description,
        story_points: formData.story_points,
        priority: formData.priority,
        deadline: formData.deadline,
        projects: projectIds,
        assigned_by: user.email,
      };
  
      console.log('Submitting payload:', payload);
      const postResponse = await axios.post('http://localhost:8000/djapp/create_compulsory_issue/', payload);
  
      if (postResponse.status === 201) {
        alert('Compulsory issue created for all projects in the group.');
        setFormData({  // Reset form fields
          issue_name: '',
          story_points: 1,
          description: '',
          priority: 'Medium',
          deadline: '',
        });
        setShowForm(false); // Close the form after successful submission
      }
    } catch (error) {
      console.error('Error creating issue:', error);
      alert('Failed to create compulsory issue.');
    }
  };
  

  const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(today.getDate() + 1);
const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <div>
      {!showForm && (
        <button className="create-project-button" onClick={toggleForm}>
          Create Compulsory Issue
        </button>
      )}

      {showForm && (
        <div className="popup-overlay">
          <div className="popup-content">
            <button className="close-button" onClick={toggleForm}>&times;</button> {/* Close button */}
            <h3>Create Compulsory Issue</h3>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Issue Name"
                value={formData.issue_name}
                onChange={(e) => setFormData({ ...formData, issue_name: e.target.value })}
                required
              />
              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
              <select
                value={formData.story_points}
                onChange={(e) => setFormData({ ...formData, story_points: parseInt(e.target.value) })}
                required
              >
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={5}>5</option>
                <option value={8}>8</option>
                <option value={13}>13</option>
              </select>
              <input
                type="date"
                value={formData.deadline}
                min={minDate} // Ensures the deadline can't be today or earlier
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              />
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="Highest">Highest</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
                <option value="Lowest">Lowest</option>
              </select>
              <button type="submit">Create</button>
              <button type="button" onClick={toggleForm}>Cancel</button>
            </form>
            {/* <FileComp /> */}
          </div>
        </div>
      )}
    </div>
  );
}
