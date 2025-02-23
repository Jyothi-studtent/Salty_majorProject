import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { connect } from 'react-redux';
import { useNavigate } from 'react-router-dom'; // Import useNavigate hook
import { clickProject } from '../actions/auth';
import './css/project_list.css'; // Updated CSS file name

const ProjectList = ({ user, clickProject }) => {
    const [projects, setProjects] = useState([]);
    const navigate = useNavigate(); // Initialize navigate

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await axios.get('http://localhost:8000/djapp/project_list/', {
                    params: { email: user.email }
                });
                setProjects(response.data);
            } catch (error) {
                console.error('Error fetching projects:', error);
            }
        };

        fetchProjects();
    }, [user]);

    const handleProjectClick = (project) => {
        clickProject({
            projectid: project.projectid,
            projectname: project.projectname,
            teamlead_email: project.teamlead_email
        });
        navigate(`/project/${project.projectid}/backlog`); // Navigate to the project details page
    };

    return (
        <>
        <h2>Projects</h2>
        <div className="projectListContainer"> {/* Updated CSS class name */}
           
            <table className="projectListTable"> {/* Updated CSS class name */}
                <thead>
                    <tr>
                        <th>Project key</th>
                        <th>Project name</th>
                        <th>Team lead </th>
                    </tr>
                </thead>
                <tbody>
                    {projects.map(project => (
                        // Make the entire row clickable
                        <tr key={project.projectid} onClick={() => handleProjectClick(project)}>
                            <td>{project.projectname}</td>
                            <td>{project.projectid}</td>
                            <td>{project.teamlead_email}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        </>
    );
};

const mapStateToProps = state => ({
    user: state.auth.user
});

const mapDispatchToProps = {
    clickProject
};

export default connect(mapStateToProps, mapDispatchToProps)(ProjectList);
