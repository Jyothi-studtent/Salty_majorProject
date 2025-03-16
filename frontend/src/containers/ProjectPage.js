import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Add_team_members from './Add_team_members';
import './css/project_page.css'; // Import the CSS file
import Team_dropdown from './Team_dropdown';

const ProjectPage = () => {
  const { projectid } = useParams();
  const [teamLead, setTeamLead] = useState(null);
  const [teamLeadPictureUrl, setTeamLeadPictureUrl] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredEmail, setHoveredEmail] = useState(null); // State to store hovered email

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/djapp/team_lead/${projectid}`); 
        const { team_lead_email, team_lead_picture_url, team_members } = response.data;
        setTeamLead(team_lead_email);
        setTeamLeadPictureUrl(team_lead_picture_url);
        setTeamMembers(team_members);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching project data:', error);
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [projectid]);

  const handleMouseOver = (email) => {
    setHoveredEmail(email); // Update the state with hovered email
  };

  const handleMouseOut = () => {
    setHoveredEmail(null); // Reset the state when mouse moves out
  };

  const getInitialStyle = (picture) => {
    if (typeof picture === 'object' && picture.initial) {
      return {
        backgroundColor: picture.background_color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '16px',
      };
    }
    return { backgroundImage: `url(${picture})` };
  };

  return (
    <div className="project-container">
     

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="team-container">
          {teamMembers.map((member, index) => (
            <div key={index} className="picture-container" onMouseOver={() => handleMouseOver(member.email)} onMouseOut={handleMouseOut}>
              <div className="circle" style={getInitialStyle(member.picture_url)}>
                {typeof member.picture_url === 'object' && member.picture_url.initial}
              </div>
              {hoveredEmail === member.email && <div className="email-popup">{member.email}</div>}
            </div>
          ))}
        </div>
      )}
      
    </div>
  );
};

export default ProjectPage;
