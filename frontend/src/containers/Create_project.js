import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom'; // Import useParams
import { createProject } from '../actions/auth';
import './css/create_project.css';

const Project = ({ isAuthenticated, user, createProject, project, setProjects }) => {
    const [showForm, setShowForm] = useState(false);
    const [projectName, setProjectName] = useState('');
    const [projectId, setProjectId] = useState(''); // Store the project ID here
    const navigate = useNavigate();
    const { group_id } = useParams(); // Extract group_id from the URL path

    // Function to fetch the next available project ID
    const fetchProjectId = async () => {
        try {
            const response = await fetch(`http://localhost:8000/djapp/${group_id}/next-project-id`);
            const data = await response.json();
            if (data.projectid) {
                setProjectId(data.projectid); // Set the next project ID
            }
        } catch (error) {
            console.error('Error fetching project ID:', error);
        }
    };

    // Trigger fetching of project ID when the form opens
    const handleFormOpen = () => {
        setShowForm(true);
        fetchProjectId(); // Fetch the project ID when the form opens
    };

    const handleProjectNameChange = (e) => {
        const newName = e.target.value;
        setProjectName(newName);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await createProject({
                projectname: projectName,
                projectid: projectId, // Send projectid to the backend
                teamlead: user.email,
                group_id: group_id, // Include group_id from URL path
            });

            // Update project list after creating a project
            if (response && response.data) {
                setProjects((prevProjects) => [...prevProjects, response.data]);
            }

            setProjectName('');
            setProjectId(''); // Reset project ID after submission
            setShowForm(false); // Hide form after submission
        } catch (error) {
            console.error('Error creating project:', error);
            let errorMessage = 'Error creating project:';

            if (error.response) {
                errorMessage = error.response.data.error || 'Something went wrong.';
            } else if (error.request) {
                errorMessage = 'No response from server. Check your internet connection.';
            }

            alert(errorMessage);
        }
    };

    useEffect(() => {
        if (project && project.projectid) {
            navigate(`/group/${group_id}/project/`);
        }
    }, [project, navigate, group_id]);

    return (
        <span className="create-project">
            {!showForm && (
                <button className="create-project-button" onClick={handleFormOpen}>Create Project</button>
            )}
            {showForm && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close" onClick={() => setShowForm(false)}>&times;</span>
                        <form onSubmit={handleSubmit} className="project-form">
                            <h3 className="projectName">Create a Scrum project</h3>
                            <div className="project-form-inputs">
                                {/* Project ID displayed as read-only */}
                                
                                <label>Enter Project name</label>
                                <input
                                    type="text"
                                    id="projectName"
                                    value={projectName}
                                    onChange={handleProjectNameChange}
                                    required
                                />
                                <label>Project ID</label>
                                <input
                                    type="text"
                                    id="projectId"
                                    value={projectId} // Display the project ID here
                                    readOnly
                                    disabled
                                />
                                <label>Team Lead</label>
                                <input
                                    type="text"
                                    id="teamLead"
                                    value={user.email} // Set team lead to user's email
                                    readOnly // Make the field read-only
                                    disabled // Disable the field so it can't be edited
                                />
                                <button type="submit">Create Project</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </span>
    );
};

const mapStateToProps = (state) => ({
    isAuthenticated: state.auth.isAuthenticated,
    user: state.auth.user,
    project: state.auth.project,
});

export default connect(mapStateToProps, { createProject })(Project);
