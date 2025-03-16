import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './css/CreateIssueForm.css';
import Scroll from '../components/Scroll';
import { connect } from 'react-redux';
import { FaAngleDoubleUp, FaAngleUp, FaAngleDown } from "react-icons/fa";
import { MdDensityMedium } from "react-icons/md";
import FileComp from './FileComp';

const IssueForm = ({ onClose, user }) => {
  const [issueType, setIssueType] = useState('');
  const [issueName, setIssueName] = useState('');
  const [status, setStatus] = useState('');
  const [summary, setSummary] = useState('');
  const [assignee, setAssignee] = useState('');
  const [sprint, setSprint] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [assigneeOptions, setAssigneeOptions] = useState([]);
  const [sprintOptions, setSprintOptions] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [storyPoint, setStoryPoint] = useState('');
  const [priority, setPriority] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
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

      if (attachment) {
        formData.append('Attachment', attachment);
      }

      await axios.post('http://localhost:8000/djapp/create_issue/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      onClose();
    } catch (error) {
      console.error('Error creating issue:', error);
    }
  };

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/djapp/list_projects_user_is_part_of/?email=${user.email}`);
        console.log("Fetched Projects: ", response.data); // Debugging log
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

  const handleStoryPointChange = (e) => {
    setStoryPoint(e.target.value);
  };

  const handleAttachmentChange = (e) => {
    setAttachment(e.target.files[0]);
  };

  return (
    <form onSubmit={handleSubmit} className="create-issue-form">
      <Scroll>
        <div>
          <label>Project:</label>
          <select value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)}>
            <option value="">Select...</option>
            {projects.length > 0 ? (
              projects.map((project) => (
                <option key={project.projectid} value={project.projectid}>
                  {project.projectname}
                </option>
              ))
            ) : (
              <option value="" disabled>Loading...</option>
            )}
          </select>
        </div>

        <div>
          <label>Issue Type:</label>
          <select value={issueType} onChange={(e) => setIssueType(e.target.value)}>
            <option value="">Select...</option>
            <option value="Story">Story</option>
            <option value="Task">Task</option>
            <option value="Bug">Bug</option>
          </select>
        </div>

        <div>
          <label>Issue Name:</label>
          <input
            type="text"
            required
            value={issueName}
            onChange={(e) => setIssueName(e.target.value)}
          />
        </div>

        <div>
          <label>Summary:</label>
          <textarea value={summary} onChange={(e) => setSummary(e.target.value)} />
        </div>
        <div>
          <label>Story Points:</label>
          <select value={storyPoint} onChange={handleStoryPointChange}>
            <option value="">Select...</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="5">5</option>
            <option value="8">8</option>
            <option value="13">13</option>
          </select>
        </div>

        <div>
          <label>Priority:</label>
          <select value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="">Select...</option>
            <option value="Highest">Highest</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
            <option value="Lowest">Lowest</option>
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
        <div>
          <label>Assignee:</label>
          <select value={assignee} onChange={(e) => setAssignee(e.target.value)}>
            <option value="">Select</option>
            {assigneeOptions.map(user => (
              <option key={user.email} value={user.email}>
                {`${user.first_name} ${user.last_name}`}
              </option>
            ))}
          </select>
        </div>

        {/* <div>
          <label>File:</label>
          <FileComp issueId={issue.id} issue_id={issue.issue_id} isEditing={isEditing} />
        </div> */}

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
