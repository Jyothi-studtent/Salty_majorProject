import React, { useState, useEffect } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { connect } from 'react-redux';
import { login } from '../actions/auth';
import axios from 'axios';
import './css/login.css';

const Login = ({ login, isAuthenticated }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const projectId = searchParams.get('projectid');
    const initialMessage = searchParams.get('message');
    const [message, setMessage] = useState({ type: null, text: initialMessage || '' });

    const { email, password } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
    
        const error = await login(email, password);
    
        if (projectId != null) {
            try {
                await axios.post('http://localhost:8000/djapp/process_invitation_token/', { email: email, projectid: projectId });
            } catch (err) {
                if (err.response && err.response.status === 404) {
                    setMessage({ type: 'error', text: 'Invitation token processing endpoint not found.' });
                } else {
                    setMessage({ type: 'error', text: 'An error occurred while processing the invitation token.' });
                }
                setTimeout(() => {
                    setMessage({ type: null, text: '' });
                }, 3000);
            }
        }
    
        if (error) {
            setMessage({ type: 'error', text: error });
            setTimeout(() => {
                setMessage({ type: null, text: '' });
            }, 3000); // Clear message after 3 seconds
        }
    };
    
    const continueWithGoogle = async () => {
        try {
            const res = await axios.get(`${process.env.REACT_APP_API_URL}/auth/o/google-oauth2/?redirect_uri=http://localhost:8000`);
            window.location.replace(res.data.authorization_url);
        } catch (err) {
            setMessage({ type: 'error', text: 'Google login failed, please try again.' });
            setTimeout(() => {
                setMessage({ type: null, text: '' });
            }, 3000); // Clear message after 3 seconds
        }
    };

    useEffect(() => {
        let timeout;
        if (message.text !== '') {
            timeout = setTimeout(() => {
                setMessage({ type: null, text: '' });
            }, 3000);
        }
        return () => clearTimeout(timeout);
    }, [message]);

    if (isAuthenticated) {
        return <Navigate to='/project' />;
    }

    return (
        <div className='login-page'>
            <div className='login-container'>
                {message.text && (
                    <div id="login-mess" className={`message ${message.type}`}>
                        {message.text}
                    </div>
                )}
                <p className='login-text'>Not a member? <Link to='/signup' className='login-link'>Register now</Link></p>
                <h1 className='login-title'>Hello Again!</h1>
                <form onSubmit={onSubmit}>
                    <div className='login-form-group'>
                        <input
                            className='login-form-control'
                            type='email'
                            placeholder='Email'
                            name='email'
                            value={email}
                            onChange={onChange}
                            required
                        />
                    </div>
                    <div className='login-form-group'>
                        <input
                            className='login-form-control'
                            type='password'
                            placeholder='Password'
                            name='password'
                            value={password}
                            onChange={onChange}
                            minLength='6'
                            required
                        />
                    </div>
                    <p className='login-recovery'>
                        <Link to='/reset_password' className='login-link'>Recovery Password</Link>
                    </p>
                    <button className='login-btn login-btn-primary' type='submit'>Sign In</button>
                </form>
            </div>
        </div>
    );
};

const mapStateToProps = state => ({
    isAuthenticated: state.auth.isAuthenticated
});

export default connect(mapStateToProps, { login })(Login);
