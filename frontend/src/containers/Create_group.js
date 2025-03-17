import React, { useState, useEffect } from 'react';
import { connect, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { createGroup } from '../actions/auth';
import './css/create_group.css';

const CreateGroup = ({ createGroup, onGroupCreated }) => {
    const user = useSelector(state => state.auth.user);
    const [groupName, setGroupName] = useState('');
    const [groupId, setGroupId] = useState('');
    const [groupHead] = useState(user?.email || '');
    const [showForm, setShowForm] = useState(false);
    const [existingGroupIds, setExistingGroupIds] = useState([]);
    const navigate = useNavigate();

    // 🔹 Fetch all existing group IDs
    useEffect(() => {
        const fetchGroupIds = async () => {
            try {
                const response = await axios.get('http://localhost:8000/djapp/get_all_group_ids/');
                setExistingGroupIds(response.data.group_ids || []);
            } catch (error) {
                console.error("Error fetching group IDs:", error);
            }
        };

        fetchGroupIds();
    }, []);

    // 🔹 Generate Base ID (Fully Dynamic)
    const generateBaseGroupId = (name) => {
        let words = name.toUpperCase().split(/\s+/);
        let baseId = words.map(w => w.charAt(0)).join('').slice(0, 5); // Take first letters

        while (baseId.length < 5) baseId += 'X'; // Ensure at least 5 chars

        return baseId;
    };

    // 🔹 Ensure Unique Group ID
    const ensureUniqueGroupId = (baseId) => {
        let finalId = baseId;
        let counter = 1;

        while (existingGroupIds.includes(finalId)) {
            finalId = `${baseId.slice(0, 4)}${counter}`; // Append counter
            counter++;
        }

        return finalId;
    };

    // 🔹 Handle Name Change
    const handleGroupNameChange = (e) => {
        const newName = e.target.value;
        setGroupName(newName);

        if (newName.trim()) {
            const baseId = generateBaseGroupId(newName);
            const uniqueId = ensureUniqueGroupId(baseId);
            setGroupId(uniqueId);
        } else {
            setGroupId('');
        }
    };

    // 🔹 Handle Form Submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createGroup({ groupname: groupName, groupid: groupId, grouphead: groupHead });

            // Refresh existing group IDs after creating a new one
            setExistingGroupIds([...existingGroupIds, groupId]);
            setGroupName('');
            setGroupId('');
            setShowForm(false);

            if (onGroupCreated) {
                onGroupCreated();
            }
        } catch (error) {
            console.error('Error creating group:', error);
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
                                <input type="text" value={groupName} onChange={handleGroupNameChange} required />
                                <label>Group Key</label>
                                <input type="text" value={groupId} readOnly disabled />
                                <label>Group Head</label>
                                <input type="text" value={groupHead} readOnly disabled />
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
