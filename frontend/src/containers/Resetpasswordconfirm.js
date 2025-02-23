import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { connect } from 'react-redux';
import { reset_password_confirm } from '../actions/auth';
import { useParams } from 'react-router-dom'; 
import './css/reset_confirm.css';


const ResetPasswordConfirm = ({ reset_password_confirm }) => {
    const [requestSent, setRequestSent] = useState(false);
    const [formData, setFormData] = useState({
        new_password: '',
        re_new_password: ''
    });

    const { uid, token } = useParams(); // Use useParams to access route parameters

    const { new_password, re_new_password } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = e => {
        e.preventDefault();

        reset_password_confirm(uid, token, new_password, re_new_password);
        setRequestSent(true);
    };

    if (requestSent) {
        return <Navigate to='/' />;
    }

    return (
        <div className='reset-password-confirm-container'>
            <h3 className='reset_head'>Reset Password</h3>
            <form onSubmit={e => onSubmit(e)}>
                <div className='reset-password-confirm-form-group'>
                    <input
                        className='reset-password-confirm-input'
                        type='password'
                        placeholder='New Password'
                        name='new_password'
                        value={new_password}
                        onChange={e => onChange(e)}
                        minLength='6'
                        required
                    />
                </div>
                <div className='reset-password-confirm-form-group'>
                    <input
                        className='reset-password-confirm-input'
                        type='password'
                        placeholder='Confirm New Password'
                        name='re_new_password'
                        value={re_new_password}
                        onChange={e => onChange(e)}
                        minLength='6'
                        required
                    />
                </div>
                <button className='reset-password-confirm-btn-primary' type='submit'>Reset Password</button>
            </form>
        </div>
    );
};

export default connect(null, { reset_password_confirm })(ResetPasswordConfirm);
