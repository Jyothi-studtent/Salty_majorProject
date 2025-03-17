import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const getCSRFToken = async () => {
    try {
        const response = await axios.get('http://localhost:8000/djapp/csrf/', { withCredentials: true });
        return response.data.csrfToken;  // Ensure backend sends csrfToken in response
    } catch (error) {
        console.error("Error fetching CSRF token:", error);
        return null;
    }
};

const AcceptInvitation = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [message, setMessage] = useState("Click Accept to join the project.");
    const [loading, setLoading] = useState(false);
    const [csrfToken, setCsrfToken] = useState(null);

    // ✅ Extract email and project_id from query params
    const queryParams = new URLSearchParams(location.search);
    const email = queryParams.get("email");
    const project_id = queryParams.get("project_id");

    console.log("Extracted email:", email);
    console.log("Extracted project_id:", project_id);

    useEffect(() => {
        const fetchCsrfToken = async () => {
            const token = await getCSRFToken();
            setCsrfToken(token);
        };
        fetchCsrfToken();
    }, []);

    const handleAccept = async () => {
        setLoading(true);
        try {
            const requestData = { email, project_id };

            console.log("Sending data:", requestData);
            console.log("CSRF Token:", csrfToken);

            const response = await axios.post(
                'http://localhost:8000/djapp/confirm_accept_invite/',  
                requestData,  
                { 
                    headers: { 
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrfToken  // ✅ Send CSRF token
                    }, 
                    withCredentials: true  // ✅ Ensure cookies are sent
                }
            );

            console.log("Response:", response.data);
            setMessage(response.data.message);
            setTimeout(() => navigate('/login'), 2000);
        } catch (error) {
            console.error("Error in AcceptInvitation:", error.response ? error.response.data : error.message);
            setMessage("Failed to accept the invitation.");
            setLoading(false);
        }
    };

    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h3>{message}</h3>
            {loading ? <p>🔄 Processing...</p> : <button onClick={handleAccept} disabled={!csrfToken}>Accept Invitation</button>}
        </div>
    );
};

export default AcceptInvitation;
