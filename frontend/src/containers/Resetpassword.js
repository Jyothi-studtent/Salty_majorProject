import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { connect } from 'react-redux';
import { reset_password } from '../actions/auth';
import './css/reset_password.css';


const ResetPassword = ({ reset_password }) => {
    const [requestSent, setRequestSent] = useState(false);
    const [formData, setFormData] = useState({
        email: ''
    });

    const { email } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = e => {
        e.preventDefault();

        reset_password(email);
        setRequestSent(true);
    };

    if (requestSent) {
        return <Navigate to='/' />
    }

    return (
        <div className='reset-password-container'>
            <h5 className='reset-password-title'>Request Password Reset</h5>
            <form onSubmit={e => onSubmit(e)}>
                <div className='reset-password-form-group'>
                    <input
                        className='reset-password-input'
                        type='email'
                        placeholder='Email'
                        name='email'
                        value={email}
                        onChange={e => onChange(e)}
                        required
                    />
                </div>
                <button className='reset-password-btn-primary' type='submit'>Reset Password</button>
            </form>
        </div>
    );
};

export default connect(null, { reset_password })(ResetPassword);
