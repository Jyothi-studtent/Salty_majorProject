import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const getCSRFToken = () => {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'csrftoken') return value;
    }
    return null;
};

const JoinProject = () => {
    const { token } = useParams();  // Extract token from URL
    const navigate = useNavigate();
    const [message, setMessage] = useState("Processing your invitation...");
    const [loading, setLoading] = useState(true); // ✅ Spinner state

    useEffect(() => {
        const acceptInvitation = async () => {
            try {
                const csrfToken = getCSRFToken();

                const response = await axios.post(
                    'http://localhost:8000/djapp/accept_invite/',  
                    { token },  
                    { headers: { 
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrfToken  
                    } }
                );

                setMessage(response.data.message);
                setLoading(false); // ✅ Hide spinner

                // ✅ Redirect based on backend response
                if (response.data.redirect) {
                    setTimeout(() => navigate(response.data.redirect), 2000);
                }

            } catch (error) {
                setMessage("Invalid or expired invitation.");
                setLoading(false);
                console.error("Error:", error.response ? error.response.data : error.message);
            }
        };

        acceptInvitation();
    }, [token, navigate]);

    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            {loading ? <p>🔄 Processing...</p> : <h3>{message}</h3>}
        </div>
    );
};

export default JoinProject;
