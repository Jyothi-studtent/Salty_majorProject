import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { connect } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { clickGroup } from '../actions/auth';
import AddTeachers from './AddTeachers';
import './css/project_list.css';

const GroupList = ({ user, clickGroup, refreshFlag }) => {
    const [groups, setGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchGroups = async () => {
            if (!user || !user.email) return; // ✅ Prevent API call if user is not available

            try {
                const response = await axios.get('http://localhost:8000/djapp/group_list/', {
                    params: { email: user.email }
                });

                // ✅ Ensure unique groups
                const uniqueGroups = response.data.reduce((acc, group) => {
                    if (!acc.some(g => g.group_id === group.group_id)) {
                        acc.push(group);
                    }
                    return acc;
                }, []);

                setGroups(uniqueGroups);
            } catch (error) {
                console.error('Error fetching groups:', error);
                setGroups([]);
            }
        };

        fetchGroups();
    }, [user, refreshFlag]);

    const handleGroupClick = (group) => {
        clickGroup({
            group_id: group.group_id,
            group_name: group.group_name,
            group_head: group.group_head
        });
        navigate(`/group/${group.group_id}/project`);
    };

    // ✅ Check if the user should see the "Actions" column
    const canManageGroups = user?.is_admin || groups.some(group => group.group_head === user?.email);

    return (
        <>
            <h2 style={{ marginTop: '-60px', marginLeft:"40px" }}>Groups</h2> 
            <div className="projectListContainer">
                <table className="projectListTable">
                    <thead>
                        <tr>
                            <th>Group Key</th>
                            <th>Group Name</th>
                            <th>Group Head</th>
                            {canManageGroups && <th>Actions</th>} {/* ✅ Only show Actions if needed */}
                        </tr>
                    </thead>
                    <tbody>
                        {groups.length > 0 ? (
                            groups.map(group => (
                                <tr key={group.group_id}>
                                    <td onClick={() => handleGroupClick(group)}>{group.group_id}</td>
                                    <td onClick={() => handleGroupClick(group)}>{group.group_name}</td>
                                    <td onClick={() => handleGroupClick(group)}>{group.group_head}</td>

                                    {(user?.is_admin || user?.email === group.group_head) && (
                                        <td>
                                            <button onClick={() => setSelectedGroup(group)}>Add Members</button>
                                        </td>
                                    )}
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan={canManageGroups ? "4" : "3"}>No groups available</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {selectedGroup && <AddTeachers group={selectedGroup} onClose={() => setSelectedGroup(null)} />}
        </>
    );
};

const mapStateToProps = state => ({ user: state.auth.user });
const mapDispatchToProps = { clickGroup };

export default connect(mapStateToProps, mapDispatchToProps)(GroupList);
