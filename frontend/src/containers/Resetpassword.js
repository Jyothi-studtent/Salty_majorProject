import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { connect } from 'react-redux';
import { reset_password } from '../actions/auth';
import './css/reset_password.css';

const ResetPassword = ({ reset_password }) => {
    const [requestSent, setRequestSent] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [formData, setFormData] = useState({
        email: ''
    });

    const { email } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const checkEmailExists = async () => {
        try {
            console.log("email to check", email);
            const response = await fetch('http://localhost:8000/djapp/check-email/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();
            console.log("error in email", data.email_exists);
            if (response.ok) {
                return data.email_exists;  // Return true if email exists
            } else {
                setErrorMessage(data.message || 'Something went wrong.');
                setTimeout(() => {
                    setErrorMessage('');
                }, 3000);  // Clear error message after 3000 ms
                return false;
            }
        } catch (err) {
            setErrorMessage('An error occurred while checking the email.');
            setTimeout(() => {
                setErrorMessage('');
            }, 3000);  // Clear error message after 3000 ms
            return false;
        }
    };

    const onSubmit = async e => {
        e.preventDefault();
        const emailExists = await checkEmailExists();
        if (emailExists) {
            reset_password(email);
            setRequestSent(true);
        }
    };

    if (requestSent) {
        return <Navigate to='/' />
    }

    return (
        <div className='reset-password-container'>
            <h5 className='reset-password-title'>Request Password Reset</h5>
            {errorMessage && (
                <div className='error-message'>
                    {errorMessage}
                </div>
            )}
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
