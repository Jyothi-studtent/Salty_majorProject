import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const JoinProject = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [message, setMessage] = useState("");

    useEffect(() => {
        const acceptInvitation = async () => {
            try {
                const response = await axios.post(`http://localhost:8000/djapp/accept_invite/`, { token });
                setMessage(response.data.message);
                setTimeout(() => navigate('/dashboard'), 2000); // Redirect after success
            } catch (error) {
                setMessage("Invalid or expired invitation.");
            }
        };

        acceptInvitation();
    }, [token, navigate]);

    return (
        <div>
            <h3>{message}</h3>
        </div>
    );
};

export default JoinProject;
