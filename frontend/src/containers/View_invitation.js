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
