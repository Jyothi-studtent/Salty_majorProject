import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { connect } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { clickProject } from '../actions/auth';
import './css/project_list.css';

const ProjectList = ({ user, clickProject }) => {
    const [projects, setProjects] = useState([]);
    const navigate = useNavigate();
    const { group_id } = useParams();

    useEffect(() => {
        const fetchProjects = async () => {
            if (!group_id || !user?.email) return;

            try {
                console.log("📢 Fetching projects for group:", group_id);
                const response = await axios.get('http://localhost:8000/djapp/project_list/', {
                    params: { email: user.email, group_id: group_id }
                });
                setProjects(response.data);
                console.log("✅ Projects fetched:", response.data);

                // ✅ Save last visited group to prevent back navigation issue
                sessionStorage.setItem("lastVisitedGroup", group_id);
            } catch (error) {
                console.error('❌ Error fetching projects:', error);
            }
        };

        fetchProjects();
    }, [user, group_id]);

    const handleProjectClick = (project) => {
        console.log(`📌 Navigating to backlog for project: ${project.projectid}`);

        clickProject({
            projectid: project.projectid,
            projectname: project.projectname,
            teamlead_email: project.teamlead_email
        });

        const handleProjectClick = (project) => {
            console.log(`📌 Navigating to backlog for project: ${project.projectid}`);
        
            clickProject({
                projectid: project.projectid,
                projectname: project.projectname,
                teamlead_email: project.teamlead_email
            });
        
            // ✅ First navigate to project list before going to backlog
            navigate(`/group/${group_id}/project`, { replace: false });
        
            // ✅ Then navigate to backlog (this ensures the back button first goes to project)
            navigate(`/group/${group_id}/project/${project.projectid}/backlog`, { replace: false });
        };
        
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

// Track last visited group when going back
const handleBackNavigation = (navigate) => {
    const lastGroup = sessionStorage.getItem("lastVisitedGroup");
    if (lastGroup) {
        navigate(`/group/${lastGroup}/project`, { replace: true });
    } else {
        navigate('/group', { replace: true }); // Default to group list
    }
};

const mapStateToProps = state => ({
    user: state.auth.user
});

const mapDispatchToProps = {
    clickProject
};

export default connect(mapStateToProps, mapDispatchToProps)(ProjectList);
