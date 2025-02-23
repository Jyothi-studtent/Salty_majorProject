import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './css/team_dropdown.css';
import { FaRegCircleUser } from "react-icons/fa6";

const getRandomColor = () => {
  return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
};

const generatePlaceholderPicture = (email) => {
  return {
    background_color: getRandomColor(),
    initial: email[0].toUpperCase()
  };
};

const Team_dropdown = () => {
  const [teamLeadEmail, setTeamLeadEmail] = useState('');
  const [teamLeadPictureUrl, setTeamLeadPictureUrl] = useState('');
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const { projectid } = useParams();

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        console.log(projectid);
        const response = await fetch(`http://localhost:8000/djapp/team_lead/${projectid}`);
        const data = await response.json();
        setTeamLeadEmail(data.team_lead_email);
        setTeamLeadPictureUrl(data.team_lead_picture_url);
        setTeamMembers(data.team_members);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching team data:', error);
      }
    };

    fetchTeamData();
  }, [projectid]);

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const getInitialStyle = (picture) => {
    if (typeof picture === 'object' && picture.initial) {
      return {
        backgroundColor: picture.background_color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        width: '30px', // Adjusted width for the circle
        height: '30px', // Adjusted height for the circle
        borderRadius: '50%',
        fontSize: '16px', // Font size for the initial
      };
    }
    return { backgroundImage: `url(${picture})` };
  };

  return (
    <div className="dropdown-team">
      <FaRegCircleUser className='team-icon' onClick={toggleDropdown} />
      {dropdownVisible && (
        <div className="dropdown-content">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="member-list">
              {teamMembers.map((member, index) => (
                <div key={index} className="member-option">
                  <div className="circle-drop" style={getInitialStyle(member.picture_url)}>
                    {typeof member.picture_url === 'object' && member.picture_url.initial}
                  </div>
                  <span>{member.email}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Team_dropdown;
