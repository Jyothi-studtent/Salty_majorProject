import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { connect } from 'react-redux';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import './css/Contribution.css';
import Sidebar from "../components/Sidebar";
import ProjectPage from './ProjectPage';
import { useNavigate,useParams } from 'react-router-dom';

ChartJS.register(ArcElement, Tooltip, Legend);

function Contributions({ user }) {
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState('');
    const [doneData, setDoneData] = useState([]);
    const [assignedData, setAssignedData] = useState([]);
const {group_id} = useParams();
    useEffect(() => {
        const fetchProjects = async () => {
            if (user && user.email) {
                try {
                    const response = await axios.get(`http://localhost:8000/djapp/project_list/?email=${user.email}&group_id=${group_id}`);
                    setProjects(response.data || []);
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
            }
        };

        fetchProjects();
    }, [user]);

    useEffect(() => {
        const fetchIssueStatistics = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/djapp/project/${selectedProject}/issue_statistics/`);
                const { done_data = {}, assigned_data = {} } = response.data;
               
                // Transform data into arrays for Chart.js
                const transformData = (data) => {
                    return {
                        labels: Object.keys(data).map(label => label === "" ? "Unassigned" : label),
                        datasets: [
                            {
                                data: Object.values(data),
                                backgroundColor: Object.keys(data).map((_, index) => `hsl(${index * 50}, 70%, 50%)`) // Generates different colors for each label
                            }
                        ]
                    };
                };

                setDoneData(transformData(done_data));
                setAssignedData(transformData(assigned_data));
            } catch (error) {
                console.error('Error fetching issue statistics:', error);
                setDoneData([]);
                setAssignedData([]);
                let errorMessage = "Error fetching issue statistics:";

      if (error.response) {
          errorMessage = error.response.data.error || "Something went wrong.";
      } else if (error.request) {
          errorMessage = "No response from server. Check your internet connection.";
      }

      alert(errorMessage);
            }
        };

        if (selectedProject) {
            fetchIssueStatistics();
        }
    }, [selectedProject]);

    if (!user) {
        return <div>Loading...</div>;
    }

    const options = {};

    return (
        <>
        <Sidebar />
        <div className="contributions-maindiv">
        <div className="contributions-container">
            <div className="project-selection-container">
                <label className="project-selection-label">Project:</label>
                <select
                    className="project-selection-dropdown"
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                >
                    <option value="">Select Project..</option>
                    {projects.map((project) => (
                        <option key={project.projectid} value={project.projectid}>
                            {project.projectname}
                        </option>
                    ))}
                </select>
            </div>
            <div className="chart-container">
                {assignedData.datasets && assignedData.datasets[0].data.length > 0 ? (
                    <div className="chart-section">
                        <h2 className="chart-title">Issues Assigned to Each Member</h2>
                        <Pie data={assignedData} options={options} />
                    </div>
                ) : (
                    <div className="no-data-message">No assigned issues yet.</div>
                )}
                {doneData.datasets && doneData.datasets[0].data.length > 0 ? (
                    <div className="chart-section">
                        <h2 className="chart-title">Issues Done by Each Member</h2>
                        <Pie data={doneData} options={options} />
                    </div>
                ) : (
                    <div className="no-data-message">No done issues yet.</div>
                )}
            </div>
        </div>
        </div>
        </>
    );
}

const mapStateToProps = (state) => ({
    user: state.auth.user,
});

export default connect(mapStateToProps)(Contributions);


