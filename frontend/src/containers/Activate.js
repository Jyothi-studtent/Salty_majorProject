import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { connect } from 'react-redux';
import { verify } from '../actions/auth';
import { useParams } from 'react-router-dom';
import './css/verify_page.css';

const Activate = ({ verify, match }) => {
    const [verified, setVerified] = useState(false);
    const { uid, token } = useParams();

    const verify_account = e => {
      
        verify(uid, token);
        setVerified(true);
    };

    if (verified) {
        return <Navigate to='/' />
    }

    return (
       

<div className="center-container"> {/* Apply the center-container class */}
<div className="invitation-box"> {/* Apply styles to this div */}
  <h1>Verify your Account </h1>
  <button className='accept-button' onClick={verify_account} disabled={!token}>
    Verify
  </button>
</div>
</div>
        
    );
};

export default connect(null, { verify })(Activate);