import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';

export default function CompulsoryIssues() {
  const { group_id } = useParams();
  const user = useSelector((state) => state.auth.user); // Get user from Redux state
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    issue_name: '',
    story_points: 1,
    description: '',
    priority: 'Medium',
    deadline: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.issue_name || !formData.description) {
      alert('Issue Name and Description are required.');
      return;
    }

    try {
      // Fetch projects inside handleSubmit
      const response = await axios.get('http://localhost:8000/djapp/project_list/', {
        params: { email: user.email, group_id: group_id },
      });

      let projects = [];
      if (response.status === 200) {
        projects = response.data;
        console.log('Projects fetched:', projects);
      }

      // Append projects to payload
      const payload = {
        ...formData,
        group_id,
        projects, // Add projects dynamically
      };

      console.log('Submitting payload:', payload);
      const postResponse = await axios.post('http://localhost:8000/djapp/create_compulsory_issue/', payload);

      if (postResponse.status === 201) {
        alert('Compulsory issue created for all projects in the group.');
        setShowForm(false);
      }
    } catch (error) {
      console.error('Error creating issue:', error);
      alert('Failed to create compulsory issue.');
    }
  };

  return (
    <div>
      {!showForm && (
        <button className="create-project-button" onClick={() => setShowForm(true)}>
          Create Compulsory Issue
        </button>
      )}
      {showForm && (
        <div>
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
          </form>
        </div>
      )}
    </div>
  );
}
