import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { connect } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { clickProject } from '../actions/auth';
import './css/project_list.css';

const ProjectList = ({ user, clickProject }) => {
    const [projects, setProjects] = useState([]);
    const navigate = useNavigate();
    const { group_id } = useParams(); // Extract group_id from URL path

    useEffect(() => {
        const fetchProjects = async () => {
            if (!group_id) return; // Ensure group_id is present

            try {
                const response = await axios.get('http://localhost:8000/djapp/project_list/', {
                    params: { email: user.email, group_id: group_id } // Send group_id
                });
                setProjects(response.data);
            } catch (error) {
                console.error('Error fetching projects:', error);
                let errorMessage = "Error fetching projects:";

      if (error.response) {
          errorMessage = error.response.data.error || "Something went wrong.";
      } else if (error.request) {
          errorMessage = "No response from server. Check your internet connection.";
      }

      alert(errorMessage);
            }
        };

        fetchProjects();
    }, [user, group_id]);

    const handleProjectClick = (project) => {
        clickProject({
            projectid: project.projectid,
            projectname: project.projectname,
            teamlead_email: project.teamlead_email
        });
        navigate(`/group/${group_id}/project/${project.projectid}/backlog`);
    };

    return (
        <>
        <h2>Projects in Group {group_id}</h2>
        <div className="projectListContainer">
            <table className="projectListTable">
                <thead>
                    <tr>
                        <th>Project Key</th>
                        <th>Project Name</th>
                        <th>Team Lead</th>
                    </tr>
                </thead>
                <tbody>
                    {projects.length > 0 ? (
                        projects.map(project => (
                            <tr key={project.projectid} onClick={() => handleProjectClick(project)}>
                                <td>{project.projectid}</td>
                                <td>{project.projectname}</td>
                                <td>{project.teamlead_email}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="3">No projects available</td>
                        </tr>
                    )}
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
