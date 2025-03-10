import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { connect } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { clickGroup } from '../actions/auth';
import Add_group_members from './Add_group_members'; // Import new component
import './css/project_list.css';

const GroupList = ({ user, clickGroup }) => {
    const [groups, setGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const response = await axios.get('http://localhost:8000/djapp/group_list/', {
                    params: { email: user.email }
                });
                setGroups(Array.isArray(response.data) ? response.data : []);
            } catch (error) {
                console.error('Error fetching groups:', error);
                setGroups([]);
            }
        };

        fetchGroups();
    }, [user]);



    const handleGroupClick = (group) => {
        clickGroup({
            group_id: group.group_id,
            group_name: group.group_name,
            group_head: group.group_head
        });
        navigate(`/group/${group.group_id}/project`); // Updated to include group_id in the path
    };
    
    return (
        <>
            <h2>Groups</h2>
            <div className="projectListContainer">
                <table className="projectListTable">
                    <thead>
                        <tr>
                            <th>Group Key</th>
                            <th>Group Name</th>
                            <th>Group Head</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {groups.length > 0 ? (
                            groups.map(group => (
                                <tr key={group.group_id}>
                                    <td onClick={() => handleGroupClick(group)}>{group.group_id}</td>
                                    <td onClick={() => handleGroupClick(group)}>{group.group_name}</td>
                                    <td onClick={() => handleGroupClick(group)}>{group.group_head}</td>
                                    <td>
                                        <button onClick={() => setSelectedGroup(group)}>
                                            Add Members
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4">No groups available</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add Members Modal */}
            {selectedGroup && (
                <Add_group_members
                    group={selectedGroup} 
                    onClose={() => setSelectedGroup(null)} 
                />
            )}
        </>
    );
};

const mapStateToProps = state => ({
    user: state.auth.user
});

const mapDispatchToProps = {
    clickGroup
};

export default connect(mapStateToProps, mapDispatchToProps)(GroupList);
