import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './css/add_teachers.css';

const AddGroupMembers = ({ group, onClose }) => {
    const [users, setUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [existingMembers, setExistingMembers] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchEligibleUsers = async () => {
            try {
                const response = await axios.get('http://localhost:8000/djapp/get_eligible_users/');
                setUsers(response.data);
            } catch (error) {
                setError('Failed to fetch eligible users');
            }
        };

        const fetchExistingMembers = async () => {
            try {
                const response = await axios.get('http://localhost:8000/djapp/get_group_members/', {
                    params: { group_id: group.group_id }
                });
                const memberEmails = new Set(response.data.map(member => member.member_email));
                setExistingMembers(memberEmails);
            } catch (error) {
                console.error('Failed to fetch existing group members:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchEligibleUsers();
        fetchExistingMembers();
    }, [group.group_id]);

    const handleCheckboxChange = (email) => {
        setSelectedUsers(prev =>
            prev.includes(email) ? prev.filter(e => e !== email) : [...prev, email]
        );
    };

    const handleSubmit = async () => {
        if (selectedUsers.length === 0) {
            setError('Please select at least one user');
            return;
        }

        try {
            await axios.post('http://localhost:8000/djapp/add_group_members/', {
                group_id: group.group_id,
                member_emails: selectedUsers
            });

            alert('Members added successfully!');
            onClose(); // Close modal after submission
        } catch (error) {
            setError('Failed to add members');
        }
    };

    return (
        <div className="addGroupMembers-modal">
            <div className="addGroupMembers-content">
                <span className="addGroupMembers-close" onClick={onClose}>&times;</span>
                <h3 className="addGroupMembers-title">Add Members to {group.group_name}</h3>

                {loading ? (
                    <p>Loading users...</p>
                ) : error ? (
                    <p className="addGroupMembers-error">{error}</p>
                ) : (
                    <ul className="addGroupMembers-list">
                        {users.map(user => (
                            <li key={user.email} className="addGroupMembers-item">
                                <input
                                    type="checkbox"
                                    id={user.email}
                                    className="addGroupMembers-checkbox"
                                    checked={selectedUsers.includes(user.email)}
                                    onChange={() => handleCheckboxChange(user.email)}
                                    disabled={existingMembers.has(user.email)} // ✅ Disable if already in group
                                />
                                <label htmlFor={user.email}>
                                    {user.first_name} {user.last_name} - {user.email}
                                    {existingMembers.has(user.email) && <span className="addGroupMembers-already"> (Already in group)</span>} {/* ✅ Show message */}
                                </label>
                            </li>
                        ))}
                    </ul>
                )}

                <button className="addGroupMembers-submit" onClick={handleSubmit}>Add Members</button>
            </div>
        </div>
    );
};

export default AddGroupMembers;