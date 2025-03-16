import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const View_invitation = () => {
    const navigate = useNavigate();
    const [invitation, setInvitation] = useState(null);
    const token = new URLSearchParams(window.location.search).get('token');

    useEffect(() => {
        const fetchInvitation = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/djapp/view_invitation?token=${token}`);
                setInvitation(response.data);
            } catch (error) {
                console.error('Error fetching invitation:', error);
                let errorMessage = "Error fetching invitation:";

      if (error.response) {
          errorMessage = error.response.data.error || "Something went wrong.";
      } else if (error.request) {
          errorMessage = "No response from server. Check your internet connection.";
      }

      alert(errorMessage);
            }
        };
        fetchInvitation();
    }, [token]);

    const handleAccept = async () => {
        try {
            await axios.get(`http://localhost:8000/djapp/accept_invitation?token=${token}`);
            navigate('/group');
        } catch (error) {
            navigate('/login');
        }
    };

    const handleDecline = async () => {
        try {
            await axios.get(`http://localhost:8000/djapp/decline_invitation?token=${token}`);
            navigate('/');
        } catch (error) {
            console.error('Error declining invitation:', error);
            let errorMessage = "Error declining invitation:";

      if (error.response) {
          errorMessage = error.response.data.error || "Something went wrong.";
      } else if (error.request) {
          errorMessage = "No response from server. Check your internet connection.";
      }

      alert(errorMessage);
        }
    };

    if (!invitation) return <p>Loading...</p>;

    return (
        <div className="invitation-container">
            <h3>Invitation to Join {invitation.group_name}</h3>
            <p>Created by: {invitation.group_head}</p>
            <button onClick={handleAccept}>Accept</button>
            <button onClick={handleDecline}>Decline</button>
        </div>
    );
};

export default View_invitation;
