import React, { useState } from 'react';
import { connect, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createGroup } from '../actions/auth';
import './css/create_project.css'; 

const CreateGroup = ({ createGroup }) => {
    const user = useSelector(state => state.auth.user); // Fetch user from Redux state
    const [groupName, setGroupName] = useState('');
    const [groupId, setGroupId] = useState('');
    const [groupHead] = useState(user?.email || '');
    const [showForm, setShowForm] = useState(false);
    const navigate = useNavigate();

    const generateGroupId = (name) => {
        return name.slice(0, 4).toUpperCase();
    };

    const handleGroupNameChange = (e) => {
        const newName = e.target.value;
        setGroupName(newName);
        setGroupId(newName.trim() ? generateGroupId(newName) : '');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createGroup({ groupname: groupName, groupid: groupId, grouphead: groupHead });
            setGroupName('');
            setGroupId('');
            setShowForm(false);
            navigate(`/group/${groupId}/project`); // Navigate to project page after group creation
        } catch (error) {
            console.error('Error creating group:', error);
            let errorMessage = "Error creating group:";

      if (error.response) {
          errorMessage = error.response.data.error || "Something went wrong.";
      } else if (error.request) {
          errorMessage = "No response from server. Check your internet connection.";
      }

      alert(errorMessage);
        }
    };

    return (
        <div className='create-project'>
            {!showForm && (
                <button className="create-project-button" onClick={() => setShowForm(true)}>Create Group</button>
            )}
            {showForm && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close" onClick={() => setShowForm(false)}>&times;</span>
                        <form onSubmit={handleSubmit} className="project-form">
                            <h3 className="projectName">Create a Group</h3>
                            <div className='project-form-inputs'>
                                <label>Enter Group Name</label>
                                <input
                                    type="text"
                                    id="groupName"
                                    value={groupName}
                                    onChange={handleGroupNameChange}
                                    required
                                />
                                <label>Group Key</label>
                                <input
                                    type="text"
                                    id="groupId"
                                    value={groupId}
                                    readOnly
                                    disabled
                                />
                                <label>Group Head</label>
                                <input
                                    type="text"
                                    id="groupHead"
                                    value={groupHead}
                                    readOnly
                                    disabled
                                />
                                <button type="submit">Create Group</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default connect(null, { createGroup })(CreateGroup);
