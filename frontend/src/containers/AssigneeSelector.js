import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUser } from 'react-icons/fa';

const AssigneeSelector = ({ projectid, issue, onAssigneeChange }) => {
  const [assigneeColor, setAssigneeColor] = useState(null);
  const [assigneeInitial, setAssigneeInitial] = useState(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [assigneeOptions, setAssigneeOptions] = useState([]);
  const [selectedAssignee, setSelectedAssignee] = useState(issue.assignee || null);

  const handleAssigneeClick = () => {
    setDropdownVisible(!dropdownVisible);
    console.log("asigeeeee",projectid)
    console.log(dropdownVisible)
   
  };

  const handleAssigneeSelect = async (assignee) => {
    setSelectedAssignee(assignee.email);
    const assigneeEmail = assignee.email;
    await axios.post('http://localhost:8000/djapp/update_issueassignee/', { issue: issue.IssueName, assignee: assigneeEmail, projectId: projectid });
    const response = await axios.post('http://localhost:8000/djapp/fetch_assignee_color/', { assignee: assignee.email });
    setAssigneeColor(response.data.user.color);
    setAssigneeInitial(response.data.user.first_letter);
    setDropdownVisible(false);
    onAssigneeChange(assigneeEmail);
  };

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const teamMembersResponse = await axios.get(`http://localhost:8000/djapp/get_assignee/?projectid=${projectid}`);
        setAssigneeOptions(teamMembersResponse.data.team_members);
       
      } catch (error) {
        console.error('Error fetching team members:', error);
      }
    };
    fetchTeamMembers();
  }, [projectid]);

  useEffect(() => {
    const fetchColor = async () => {
      if (selectedAssignee) {
        try {
          const response = await axios.post('http://localhost:8000/djapp/fetch_assignee_color/', { assignee: selectedAssignee });
          setAssigneeColor(response.data.user.color);
          setAssigneeInitial(response.data.user.first_letter);
        } catch (error) {
          console.error('Error fetching assignee color:', error);
        }
      }
    };
    fetchColor();
  }, [selectedAssignee]);

  return (
    <div className="assignee-container2">
      <div className="assignee" onClick={handleAssigneeClick}>
        {selectedAssignee ? (
          <div className="assignee-icon" id="userIcon" style={{ backgroundColor: assigneeColor }}>
            {assigneeInitial}
          </div>
        ) : (
          <div className='assignee-icon' id="userIcon" style={{ color: 'black' }}><FaUser /></div>
        )}
      </div>
      {dropdownVisible && assigneeOptions.length > 0 && (
        <div className="usericon-dropdown">
          {assigneeOptions.map((assignee, index) => (
            <div
              key={index}
              className="usericon-dropdown-item"
              onClick={() => handleAssigneeSelect(assignee)}
            >
              {`${assignee.first_name} ${assignee.last_name}`}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AssigneeSelector;

