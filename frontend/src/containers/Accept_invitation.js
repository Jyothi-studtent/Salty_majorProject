import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

import './css/accept_invite.css';

const AcceptInvitation = () => {
  const navigate = useNavigate(); // Get the navigate function
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const token = searchParams.get('token');
  const projectId = searchParams.get('projectid');
  console.log("accept", token, projectId);

  const handleAcceptInvitation = async () => {
    try {
      const response = await axios.post('http://localhost:8000/djapp/verify_invitation_token/', { token: token, projectId:projectId});

      
      console.log('Invitation verified:', response.data);

      const projectid=response.data.projectid
     console.log("verify",response.data)

      if (response.data.action === 'signup') {
        navigate(`/signup?projectid=${projectid}`); 
      } else if (response.data.action === 'login') {
        navigate(`/login?projectid=${projectid}`);
      }
    } catch (error) {
      console.error('Error accepting invitation:', error);
    }
  };

  return (
    <div className="center-container"> {/* Apply the center-container class */}
      <div className="invitation-box"> {/* Apply styles to this div */}
        <h1>Accept the invite to join the project </h1>
        <button className='accept-button' onClick={handleAcceptInvitation} disabled={!token}>
          Accept 
        </button>
      </div>
    </div>
  );
};

export default AcceptInvitation;
