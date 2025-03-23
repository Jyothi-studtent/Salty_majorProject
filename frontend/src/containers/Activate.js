import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { connect } from 'react-redux';
import { verify } from '../actions/auth';
import { useParams } from 'react-router-dom';
import './css/verify_page.css';

const Activate = ({ verify }) => {
    const [verified, setVerified] = useState(false);
    const { uid, token } = useParams();

    const verify_account = async () => {
        console.log("🔹 In verify_account function");

        try {
            await verify(uid, token); // ✅ Ensure verify is awaited
            console.log("✅ Verification request sent");
            setVerified(true);
        } catch (error) {
            console.error("❌ Verification failed:", error);
        }
    };

    if (verified) {
        return <Navigate to="/" />;
    }

    return (
        <div className="center-container">
            <div className="invitation-box">
                <h1>Verify your Account</h1>
                <button className="accept-button" onClick={verify_account} disabled={!token}>
                    Verify
                </button>
            </div>
        </div>
    );
};

export default connect(null, { verify })(Activate);
