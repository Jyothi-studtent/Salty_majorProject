import React, { useState, useEffect } from 'react';
import './css/create_project.css';  // Reusing the create_project.css for styling

const ChangeProjectName = ({ project, closeForm, updateProjectName }) => {
    const [newProjectName, setNewProjectName] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
  
    useEffect(() => {
      if (project) {
        setNewProjectName(project.projectname);
      }
    }, [project]);
  
    const handleNewProjectNameChange = (e) => {
      setNewProjectName(e.target.value);
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
  
      if (!newProjectName) {
        setMessage('Please enter a new project name.');
        return;
      }
  
      setLoading(true);
      setMessage('');
  
      try {
        const response = await fetch(`http://localhost:8000/djapp/api/update_project_name/${project.projectid}/`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            projectname: newProjectName,
          }),
        });
  
        const result = await response.json();
  
        if (response.ok) {
          setMessage('Project name updated successfully!');
          updateProjectName({ ...project, projectname: newProjectName }); // Update the project in the parent
          setTimeout(() => {
            closeForm();
          }, 1000);
        } else {
          setMessage(result.message || 'Failed to update project name.');
        }
      } catch (error) {
        setMessage('Error occurred. Please try again.');
      } finally {
        setLoading(false);
      }
    };
  
    return (
      <div className="create-project">
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={closeForm}>&times;</span>
            <form onSubmit={handleSubmit} className="project-form">
              <h3 className="projectName">Edit Project Name</h3>
              <div className="project-form-inputs">
                <label htmlFor="newProjectName">New Project Name</label>
                <input
                  type="text"
                  id="newProjectName"
                  value={newProjectName}
                  onChange={handleNewProjectNameChange}
                  required
                />
                <label htmlFor="projectId">Project ID</label>
                <input
                  type="text"
                  id="projectId"
                  value={project.projectid}
                  readOnly
                  disabled
                />
                <label htmlFor="teamLead">Team Lead</label>
                <input
                  type="text"
                  id="teamLead"
                  value={project.teamlead_email}
                  readOnly
                  disabled
                />
                <button type="submit" className="submit-button" disabled={loading}>
                  {loading ? 'Updating...' : 'Update Project Name'}
                </button>
              </div>
            </form>
          </div>
        </div>
        {message && <p className="message">{message}</p>}
      </div>
    );
  };

export default ChangeProjectName;
