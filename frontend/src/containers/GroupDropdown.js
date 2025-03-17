import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { connect } from 'react-redux';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { clickGroup } from '../actions/auth';
import { ChevronDown, ChevronUp } from 'lucide-react';
import './css/GroupDropdown.css';

const GroupDropdown = ({ user, clickGroup }) => {
  const [groups, setGroups] = useState([]);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate(); // ✅ Use navigation

  useEffect(() => {
    const fetchGroups = async () => {
      if (!user || !user.email) return;

      try {
        const response = await axios.get('http://localhost:8000/djapp/group_list/', {
          params: { email: user.email }
        });

        const uniqueGroups = response.data.reduce((acc, group) => {
          if (!acc.some(g => g.group_id === group.group_id)) {
            acc.push(group);
          }
          return acc;
        }, []);

        setGroups(uniqueGroups);
      } catch (error) {
        console.error('Error fetching groups:', error);
        setError('Failed to fetch groups');
      }
    };

    fetchGroups();
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };

  const handleGroupClick = (group) => {
    clickGroup({
      group_id: group.group_id,
      group_name: group.group_name,
      group_head: group.group_head
    });
    navigate(`/group/${group.group_id}/project`); // ✅ Navigate to group projects
    setIsOpen(false); // ✅ Close dropdown after click
  };

  return (
    <div className="custom-dropdown" ref={dropdownRef}>
      <button className="custom-dropdown-toggle" type="button" onClick={toggleDropdown} aria-expanded={isOpen}>
        Groups
        {isOpen ? <ChevronUp className="dropdown-icon" /> : <ChevronDown className="dropdown-icon" />}
      </button>
      <ul className={`custom-dropdown-menu ${isOpen ? 'show' : ''}`}>
        {error && <li><span className="custom-text-danger">{error}</span></li>}
        {groups.length === 0 ? (
          <li><span>No groups found</span></li>
        ) : (
          groups.map(group => (
            <li key={group.group_id}>
              <button className="custom-dropdown-item" onClick={() => handleGroupClick(group)}>
                {group.group_name}
              </button>
            </li>
          ))
        )}
        <li><hr className="custom-dropdown-divider" /></li>
        <li>
          <button className="custom-dropdown-item" onClick={() => navigate('/group')}> {/* ✅ Navigate to Group List */}
            View all groups
          </button>
        </li>
      </ul>
    </div>
  );
};

const mapStateToProps = state => ({ user: state.auth.user });
const mapDispatchToProps = { clickGroup };

export default connect(mapStateToProps, mapDispatchToProps)(GroupDropdown);
