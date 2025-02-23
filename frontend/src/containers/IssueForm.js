import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './css/CreateIssueForm.css';
import Scroll from '../components/Scroll';
import { connect } from 'react-redux';
import { FaAngleDoubleUp, FaAngleUp, FaAngleDown } from "react-icons/fa";
import { MdDensityMedium } from "react-icons/md";

const IssueForm = ({ onClose, user }) => {
  const [issueType, setIssueType] = useState('');
  const [issueName, setIssueName] = useState('');
  const [status, setStatus] = useState('');
  const [summary, setSummary] = useState('');
  const [assignee, setAssignee] = useState('');
  const [sprint, setSprint] = useState('');
  const [epic, setEpic] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [assigneeOptions, setAssigneeOptions] = useState([]);
  const [sprintOptions, setSprintOptions] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [epicName, setEpicName] = useState('');
  const [assignedby, setAssignedby] = useState(user.email);
  const [epics, setEpics] = useState([]);
  const [storyPoint, setStoryPoint] = useState('');
  const [priority, setPriority] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const formData = new FormData();

        // Append form data
        formData.append('IssueType', issueType);
        formData.append('IssueName', issueName);
        formData.append('Sprint', sprint);
        formData.append('Status', status);
        formData.append('Assignee', assignee);
        formData.append('Assigned_by', user.email);
        formData.append('Description', summary);
        formData.append('ProjectId', selectedProject);
        formData.append('StoryPoint', storyPoint);
        formData.append('Priority', priority);

        // Append file only if it's not null
        if (attachment) {
            formData.append('Attachment', attachment);
        }

        if (issueType !== "Epic") {
          console.log(formData, "getting tired");
            await axios.post('http://localhost:8000/djapp/create_issue/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
           
        } else {
            formData.append('StartDate', new Date(startDate).toISOString().split('T')[0]);
            formData.append('DueDate', new Date(dueDate).toISOString().split('T')[0]);
            formData.append('epicName', epicName);

            await axios.post('http://localhost:8000/djapp/create_epic/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

        }

        onClose();
    } catch (error) {
        console.error('Error creating issue:', error);
    }
};

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/djapp/project_list/?email=${user.email}`);
        setProjects(response.data || []);
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };

    fetchProjects();
  }, [user.email]);

  useEffect(() => {
    const fetchTeamMembersAndSprints = async () => {
      try {
        if (!selectedProject) return;
        const teamMembersResponse = await axios.get(`http://localhost:8000/djapp/get_team_members/?projectid=${selectedProject}`);
        setAssigneeOptions(teamMembersResponse.data.team_members);

        const sprintsResponse = await axios.get(`http://localhost:8000/djapp/get_sprints/?projectid=${selectedProject}`);
        setSprintOptions(sprintsResponse.data.sprint_in_project);
      } catch (error) {
        console.error('Error fetching team members and sprints:', error);
      }
    };

    fetchTeamMembersAndSprints();
  }, [selectedProject]);

  useEffect(() => {
    const fetchEpics = async () => {
      try {
        if (!selectedProject) return;
        const response = await axios.get(`http://localhost:8000/djapp/get_epics/?projectid=${selectedProject}`);
        setEpics(response.data.epics_in_project);
      } catch (error) {
        console.error('Error fetching epics:', error);
      }
    };

    fetchEpics();
  }, [selectedProject]);

  const handleStoryPointChange = (e) => {
    setStoryPoint(e.target.value);
  };

  const handleAttachmentChange = (e) => {
    setAttachment(e.target.files[0]);
    console.log(e.target.files[0])
  };

  return (
    <form onSubmit={handleSubmit} className="create-issue-form">
      <Scroll>
        <div>
          <label>Project:</label>
          <select value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)}>
            <option value="">Select...</option>
            {projects.map((project) => (
              <option key={project.projectid} value={project.projectid}>
                {project.projectname}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Issue Type:</label>
          <select value={issueType} onChange={(e) => setIssueType(e.target.value)}>
            <option value="">Select...</option>
            <option value="Story">Story</option>
            <option value="Task">Task</option>
            <option value="Bug">Bug</option>
            <option value="Epic">Epic</option>
          </select>
        </div>
        {issueType === "Epic" ? (
          <div>
            <label>Epic Name:</label>
            <input
              type="text"
              value={epicName}
              required
              onChange={(e) => setEpicName(e.target.value)}
            />
          </div>
        ) : (
          <div>
            <label>Issue Name:</label>
            <input
              type="text"
              required
              value={issueName}
              onChange={(e) => setIssueName(e.target.value)}
            />
          </div>
        )}
        <div>
          <label>Summary:</label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
          />
        </div>
        <div>
          <label>Priority:</label>
          <select value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="">Select...</option>
            <option value="Highest"><FaAngleDoubleUp />Highest</option>
            <option value="High"><FaAngleUp />High</option>
            <option value="Medium"><MdDensityMedium />Medium</option>
            <option value="Low"><FaAngleDown />Low</option>
            <option value="Lowest"><FaAngleDown />Lowest</option>
          </select>
        </div>
        <div>
          <label>Status:</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Select...</option>
            <option value="To-Do">To Do</option>
            <option value="In-Progress">In Progress</option>
            <option value="Done">Done</option>
          </select>
        </div>
        <div className="story-point-container">
          <label>Story Points:</label>
          <div className="story-point-slider">
            <input
              type="range"
              min="1"
              max="3"
              value={storyPoint}
              onChange={handleStoryPointChange}
              style={{
                background: `linear-gradient(to right, blue, red)`,
                width: '100%',
              }}
            />
            <ul className="story-point-labels">
              <li>1</li>
              <li>2</li>
              <li>3</li>
            </ul>
          </div>
        </div>

        {issueType !== "Epic" && (
          <div>
            <label>Epic:</label>
            <select value={epic} onChange={(e) => setEpic(e.target.value)}>

              <option value="">Select...</option>
              {epics.map((epic) => (
                <option key={epic.Epic_Id} value={epic.Epic_Id}>
                  {epic.EpicName}
                </option>
              ))}
            </select>
          </div>
        )}
        
        <div>
          <label>Assignee:</label>
          <select value={assignee} onChange={(e) => setAssignee(e.target.value)}>
            <option value="">Select</option>
            {assigneeOptions.length > 0 ? (
              assigneeOptions.map(user => (
                <option key={user.email} value={user.email}>
                  {`${user.first_name} ${user.last_name}`}
                </option>
              ))
            ) : (
              <option value="" disabled>Loading...</option>
            )}
          </select>
        </div>
        {issueType !== "Epic" && (
          <div>
            <label>Sprint:</label>
            <select value={sprint} onChange={(e) => setSprint(e.target.value)}>
              <option value="">Select...</option>
              {sprintOptions.length > 0 ? (
                sprintOptions.map(sprint => (
                  <option key={sprint.sprint} value={sprint.sprint}>
                    {sprint.sprint}
                  </option>
                ))
              ) : (
                <option value="" disabled>Loading...</option>
              )}
            </select>
          </div>
        )}
        {issueType === "Epic" && (
          <>
            <div>
              <label>Start Date:</label>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label>Due Date:</label>
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </>
        )}
        <div>
          <label>Attachment:</label>
          <input type="file" onChange={handleAttachmentChange} />
        </div>
        <div>
          <button type="submit">Create</button>
          <button type="button" onClick={onClose}>Cancel</button>
        </div>
      </Scroll>
    </form>
  );
};

const mapStateToProps = state => ({
  user: state.auth.user
});

export default connect(mapStateToProps)(IssueForm);

