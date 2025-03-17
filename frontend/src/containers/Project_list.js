import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { connect } from 'react-redux'; // Ensure this is imported
import { useNavigate, useParams } from 'react-router-dom';
import { clickProject } from '../actions/auth';
import './css/project_list.css';
import ChangeProjectName from './ChangeProjectName';  // Import the ChangeProjectName component

const ProjectList = ({ user, clickProject }) => {
    const [projects, setProjects] = useState([]); // Initialize state to hold projects
    const [selectedProject, setSelectedProject] = useState(null); // State to manage the selected project for editing
    const [showModal, setShowModal] = useState(false); // State to manage modal visibility
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
    
        // ✅ First, navigate to project list and ensure it's added to history
        navigate(`/group/${group_id}/project`, { replace: false });
    
        // ✅ Delay backlog navigation slightly to ensure history is correctly updated
        setTimeout(() => {
            navigate(`/group/${group_id}/project/${project.projectid}/backlog`, { replace: false });
        }, 50);  // Slight delay ensures history is correctly recorded
    };

    const handleEditButtonClick = (event, project) => {
        // Stop event propagation to prevent row click
        event.stopPropagation();

        // Set selected project to pass to ChangeProjectName component
        setSelectedProject(project);
        setShowModal(true); // Show the modal
    };

    const closeModal = () => {
        setShowModal(false); // Close the modal
        setSelectedProject(null); // Reset selected project
    };

    const updateProjectNameInList = (updatedProject) => {
        setProjects(prevProjects =>
            prevProjects.map(project =>
                project.projectid === updatedProject.projectid
                    ? { ...project, projectname: updatedProject.projectname }
                    : project
            )
        );
    };

    return (
        <>
            <h2 style={{ marginLeft: "40px" }}>
                Projects in Group {group_id}
            </h2>
            <div className="projectListContainer">
                <table className="projectListTable">
                    <thead>
                        <tr>
                            <th>Project Key</th>
                            <th>Project Name</th>
                            <th>Team Lead</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {projects.length > 0 ? (
                            projects.map(project => (
                                <tr key={project.projectid} onClick={() => handleProjectClick(project)}>
                                    <td>{project.projectid}</td>
                                    <td>{project.projectname}</td>
                                    <td>{project.teamlead_email}</td>
                                    <td>
                                        <button onClick={(event) => handleEditButtonClick(event, project)}>
                                            Edit
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4">No projects available</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && selectedProject && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button className="close-modal" onClick={closeModal}>X</button>
                        <ChangeProjectName
                            project={selectedProject}
                            closeForm={closeModal}
                            updateProjectName={updateProjectNameInList} // Pass the callback
                        />
                    </div>
                </div>
            )}
        </>
    );
};

// Make sure mapStateToProps and mapDispatchToProps are defined
const mapStateToProps = (state) => ({
    user: state.auth.user
});

const mapDispatchToProps = {
    clickProject
};

// Connect Redux state and actions to the component
export default connect(mapStateToProps, mapDispatchToProps)(ProjectList);
