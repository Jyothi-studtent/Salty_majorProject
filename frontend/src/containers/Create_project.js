import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom'; // Import useParams
import { createProject } from '../actions/auth';
import './css/create_project.css';

const Project = ({ isAuthenticated, user, createProject, project }) => {
    const [showForm, setShowForm] = useState(false);
    const [projectName, setProjectName] = useState('');
    const [projectId, setProjectId] = useState('');
    const navigate = useNavigate();
    const { group_id } = useParams(); // Extract group_id from the URL path

    const generateProjectId = (name) => {
        return name.slice(0, 4).toUpperCase();
    };

    const handleProjectNameChange = (e) => {
        const newName = e.target.value;
        setProjectName(newName);
        setProjectId(newName.trim() ? generateProjectId(newName) : '');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createProject({ 
                projectname: projectName, 
                projectid: projectId, 
                teamlead: user.email,
                group_id: group_id // Include group_id from URL path
            });
            setProjectName('');
            setProjectId('');
            setShowForm(false);
        } catch (error) {
            console.error('Error creating project:', error);
        }
    };

    useEffect(() => {
        if (project && project.projectid) {
            navigate(`/group/${group_id}/project/${project.projectid}/backlog`);
        }
    }, [project, navigate, group_id]);

    return (
        <span className='create-project'>
            {!showForm && (
                <button className="create-project-button" onClick={() => setShowForm(true)}>Create Project</button>
            )}
            {showForm && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close" onClick={() => setShowForm(false)}>&times;</span>
                        <form onSubmit={handleSubmit} className="project-form">
                            <h3 className="projectName">Create a Scrum project</h3>
                            <div className='project-form-inputs'>
                                <label>Enter Project name</label>
                                <input
                                    type="text"
                                    id="projectName"
                                    value={projectName}
                                    onChange={handleProjectNameChange}
                                    required
                                />
                                <label>Project key</label>
                                <input
                                    type="text"
                                    id="projectId"
                                    value={projectId}
                                    readOnly
                                    disabled
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

const mapStateToProps = state => ({
    isAuthenticated: state.auth.isAuthenticated,
    user: state.auth.user,
    project: state.auth.project
});

export default connect(mapStateToProps, { createProject })(Project);
