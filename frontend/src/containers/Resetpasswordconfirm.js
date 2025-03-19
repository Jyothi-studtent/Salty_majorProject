import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { connect } from 'react-redux';
import { reset_password_confirm } from '../actions/auth';
import { useParams } from 'react-router-dom'; 
import './css/reset_confirm.css';

const ResetPasswordConfirm = ({ reset_password_confirm }) => {
    const [requestSent, setRequestSent] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showReNewPassword, setShowReNewPassword] = useState(false);
    const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    
    const [formData, setFormData] = useState({
        new_password: '',
        re_new_password: ''
    });

    const { uid, token } = useParams(); // Use useParams to access route parameters
    const { new_password, re_new_password } = formData;

   

    // Handle input field changes
    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    // Toggle password visibility for new_password
    const toggleShowNewPassword = () => setShowNewPassword(!showNewPassword);

    // Toggle password visibility for re_new_password
    const toggleShowReNewPassword = () => setShowReNewPassword(!showReNewPassword);

    // Show password requirements on focus
    const handlePasswordFocus = () => setShowPasswordRequirements(true);

    // Hide password requirements on blur
    const handlePasswordBlur = () => setShowPasswordRequirements(false);

    // Validate password
    const validatePassword = () => {
        const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*]).{6,}$/; // Must have capital letter, special character, and be 6 characters long
        if (!passwordRegex.test(new_password)) {
            setErrorMessage("Password must be at least 6 characters long, include a capital letter, and a special character.");
            return false;
        }
        // if (new_password === firstName || new_password === lastName || new_password === email) {
        //     setErrorMessage("Password should not be similar to your first name, last name, or email.");
        //     return false;
        // }
        if (new_password !== re_new_password) {
            setErrorMessage("Passwords do not match.");
            return false;
        }
        setErrorMessage(''); // Clear the error message if all checks pass
        return true;
    };

    // Handle form submission
    const onSubmit = e => {
        e.preventDefault();
        if (validatePassword()) {
            reset_password_confirm(uid, token, new_password, re_new_password);
            setRequestSent(true);
        }
    };

    if (requestSent) {
        return <Navigate to='/' />;
    }

    return (
        <div className='reset-password-confirm-container'>
            <h3 className='reset_head'>Reset Password</h3>

            {/* Error message at the top if validation fails */}
            {errorMessage && <div className='error-message'>{errorMessage}</div>}

            <form onSubmit={onSubmit}>
                <div className='reset-password-confirm-form-group'>
                    <input
                        className='reset-password-confirm-input'
                        type={showNewPassword ? 'text' : 'password'}
                        placeholder='New Password *'
                        name='new_password'
                        value={new_password}
                        onChange={onChange}
                        onFocus={handlePasswordFocus}
                        onBlur={handlePasswordBlur}
                        minLength='6'
                        required
                    />
                    <button
                        type='button'
                        onClick={toggleShowNewPassword}
                        className='toggle-password-visibility-btn'
                    >
                        {showNewPassword ? '🙈' : '👁️'}
                    </button>
                </div>

                <div className='reset-password-confirm-form-group'>
                    <input
                        className='reset-password-confirm-input'
                        type={showReNewPassword ? 'text' : 'password'}
                        placeholder='Confirm New Password *'
                        name='re_new_password'
                        value={re_new_password}
                        onChange={onChange}
                        
                        minLength='6'
                        required
                    />
                    <button
                        type='button'
                        onClick={toggleShowReNewPassword}
                        className='toggle-password-visibility-btn'
                    >
                        {showReNewPassword ? '🙈' : '👁️'}
                    </button>
                </div>

                {/* Password requirements shown below the password input when focused */}
                {showPasswordRequirements && (
                    <div className='password-requirements'>
                        <p>
                            <strong>Password Requirements:</strong>
                            <br />
                            ⚠️ Password should be at least 6 characters long and must include at least one capital letter and one special character, Password should not be similar to your first name, last name, or email address.
                        </p>
                    </div>
                )}

                <button className='reset-password-confirm-btn-primary' type='submit'>Reset Password</button>
            </form>
        </div>
    );
};

export default connect(null, { reset_password_confirm })(ResetPasswordConfirm);
