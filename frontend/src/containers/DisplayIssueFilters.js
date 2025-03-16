import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { connect } from 'react-redux';
import './css/DIF.css';
import CustomDropdown from './CustomDropdown';
import FileComp from './FileComp';

const DisplayIssueFilters = ({ data, user }) => {
  const [issue, setIssue] = useState(data);
  const [isEditing, setIsEditing] = useState(false);
  const [assigneeOptions, setAssigneeOptions] = useState([]);
  const [sprintOptions, setSprintOptions] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(data.projectId_id);
  const [files, setFiles] = useState([]);

  useEffect(() => {
    setIssue(data);
  }, [data]);

  useEffect(() => {
    const fetchTeamMembersAndSprints = async () => {
      try {
        const teamMembersResponse = await axios.get(`http://localhost:8000/djapp/get_team_members/?projectid=${selectedProject}`);
        setAssigneeOptions(teamMembersResponse.data.team_members);

        const sprintsResponse = await axios.get(`http://localhost:8000/djapp/get_sprints/?projectid=${selectedProject}`);
        console.log(sprintsResponse, "*******************************")
        setSprintOptions(sprintsResponse.data.sprint_in_project);
      } catch (error) {
        console.error('Error fetching team members and sprints:', error);
      }
    };

    if (selectedProject) {
      fetchTeamMembersAndSprints();
    }
  }, [selectedProject]);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setIssue(prevIssue => ({
      ...prevIssue,
      [name]: value
    }));

    if (name === 'assignee') {
      setIssue(prevIssue => ({
        ...prevIssue,
        assigned_by: user.email
      }));
    } else if (name === 'file_field') {
      setFiles([...files, ...e.target.files]);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      await axios.post(`http://localhost:8000/djapp/update_issue/`, issue);
      setIsEditing(false);
    } catch (error) {
      console.error("There was an error updating the issue!", error);
    }
  };

  return (
    <div className='display-issue-main-container'>
      {issue ? (
        <div className="display-issue-card">
          <h1 className="display-issue-title">{issue.IssueName || issue.EpicName || '----'}</h1>
          
          <p>
            <strong>Type:</strong>
            {isEditing ? (
              <select className="display-issue-select" name="IssueType" value={issue.IssueType || ''} onChange={handleChange}>
                <option value="">Select...</option>
                <option value="Story">Story</option>
                <option value="Task">Task</option>
                <option value="Bug">Bug</option>
                <option value="Epic">Epic</option>
              </select>
            ) : (
              issue.IssueType || '----'
            )}
          </p>

          <p>
            <strong>Description:</strong>
            {isEditing ? (
              <textarea className="display-issue-textarea" name="description" value={issue.description || ''} onChange={handleChange} />
            ) : (
              issue.description || '----'
            )}
          </p>

          <p>
            <strong>Status:</strong>
            {isEditing ? (
              <select className="display-issue-select" name="status" value={issue.status || ''} onChange={handleChange}>
                <option value="">Select...</option>
                <option value="To-Do">To Do</option>
                <option value="In-Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
            ) : (
              issue.status || '----'
            )}
          </p>

          <p>
            <strong>Assigned to:</strong>
            {isEditing ? (
              <CustomDropdown
                options={assigneeOptions}
                value={issue.assignee || ''}
                onChange={handleChange}
              />
            ) : (
              issue.assignee || '----'
            )}
          </p>

          <p>
            <strong>Sprint:</strong>
            {isEditing ? (
              <select className="display-issue-select" name="sprint" value={issue.sprint || ''} onChange={handleChange}>
                <option value="">Select...</option>
                {sprintOptions.map(sprint => (
                  <option key={sprint.sprint} value={sprint.sprint}>
                    {sprint.sprint}
                  </option>
                ))}
              </select>
            ) : (
              issue.sprint || '----'
            )}
          </p>

          <p>
            <strong>Story Points:</strong>
            {isEditing ? (
              <select className="display-issue-select" name="StoryPoint" value={issue.StoryPoint || ''} onChange={handleChange}>
                <option value="">Select...</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="5">5</option>
                <option value="8">8</option>
                <option value="13">13</option>
              </select>
            ) : (
              issue.StoryPoint || '----'
            )}
          </p>

          <p>
            <strong>Priority:</strong>
            {isEditing ? (
              <select className="display-issue-select" name="Priority" value={issue.Priority || ''} onChange={handleChange}>
                <option value="">Select...</option>
                <option value="Highest">Highest</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
                <option value="Lowest">Lowest</option>
              </select>
            ) : (
              issue.Priority || '----'
            )}
          </p>

          <p>
            <h3>Files:</h3>
            <FileComp issueId={issue.id} issue_id={issue.issue_id} isEditing={isEditing} />
          </p>

          {isEditing ? (
            <button className="display-issue-button" onClick={handleSave}>Save</button>
          ) : (
            <button className="display-issue-button" onClick={handleEdit}>Edit</button>
          )}
        </div>
      ) : (
        <p>No issues found</p>
      )}
    </div>
  );
};

const mapStateToProps = state => ({
  user: state.auth.user
});

export default connect(mapStateToProps)(DisplayIssueFilters);
