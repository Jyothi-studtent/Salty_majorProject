import axios from 'axios';

import {
    LOGIN_SUCCESS,
    LOGIN_FAIL,
    USER_LOADED_SUCCESS,
    USER_LOADED_FAIL,
    AUTHENTICATED_SUCCESS,
    AUTHENTICATED_FAIL,
    PASSWORD_RESET_SUCCESS,
    PASSWORD_RESET_FAIL,
    PASSWORD_RESET_CONFIRM_SUCCESS,
    PASSWORD_RESET_CONFIRM_FAIL,
    SIGNUP_SUCCESS,
    SIGNUP_FAIL,
    ACTIVATION_SUCCESS,
    ACTIVATION_FAIL,
    GOOGLE_AUTH_SUCCESS,
    GOOGLE_AUTH_FAIL,
    PROJECT_CREATE_SUCCESS,
    PROJECT_CREATE_FAIL,
    LOGOUT,
    ISSUE_ADDED_Fail,
    ISSUE_ADDED_SUCCESS,
    PROJECT_CLICK_SUCCESS,
    PROJECT_CLICK_FAIL,
    GROUP_CREATE_SUCCESS,
    GROUP_CREATE_FAIL,
    GROUP_CLICK_SUCCESS,
    GROUP_CLICK_FAIL,
 
   
} from './types';




export const createGroup = (groupData) => async (dispatch) => {
    try {
        const response = await axios.post('http://localhost:8000/djapp/create_group/', groupData);
        dispatch({ type: GROUP_CREATE_SUCCESS, payload: response.data });
    } catch (error) {
        dispatch({ type: GROUP_CREATE_FAIL, payload: error.message });
    }
};

export const createProject = (projectData) => async (dispatch) => {
    try {
        const response = await axios.post('http://localhost:8000/djapp/create/', projectData);
        dispatch({ type: PROJECT_CREATE_SUCCESS, payload: response.data });
    } catch (error) {
        dispatch({ type: PROJECT_CREATE_FAIL, payload: error.message });
    }
};



export const addIssue = (issue) => async (dispatch) => {
    console.log(issue)
    try {
        const response = await axios.post('http://localhost:8000/djapp/add/', issue)       
        dispatch({ type: ISSUE_ADDED_SUCCESS, payload: response.data });
    } catch (error) {
        console.log(error)
        dispatch({ type: ISSUE_ADDED_Fail, payload: error.message });
// actions.js
    }}

   
export const clickProject = (projectData) => (dispatch) => {
    try {
        dispatch({ type: PROJECT_CLICK_SUCCESS, payload: projectData });
    } catch (error) {
        dispatch({ type: PROJECT_CLICK_FAIL, payload: error.message });
    }
};

export const clickGroup = (groupData) => (dispatch) => {
    try {
        dispatch({ type: GROUP_CLICK_SUCCESS, payload: groupData });
    } catch (error) {
        dispatch({ type: GROUP_CLICK_FAIL, payload: error.message });
    }
};

export const load_user = () => async dispatch => {
    if (localStorage.getItem('access')) {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `JWT ${localStorage.getItem('access')}`,
                'Accept': 'application/json'
            }
        };

        try {
            const res = await axios.get(`${process.env.REACT_APP_API_URL}/auth/users/me/`, config);
   
            dispatch({
                type: USER_LOADED_SUCCESS,
                payload: res.data
            });
        } catch (err) {
            dispatch({
                type: USER_LOADED_FAIL
            });
        }
    } else {
        dispatch({
            type: USER_LOADED_FAIL
        });
    }
};


export const googleAuthenticate = (state, code) => async dispatch => {
    if (state && code && !localStorage.getItem('access')) {
        const config = {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        };

        const details = {
            'state': state,
            'code': code
        };

        const formBody = Object.keys(details).map(key => encodeURIComponent(key) + '=' + encodeURIComponent(details[key])).join('&');

        try {
            const res = await axios.post(`${process.env.REACT_APP_API_URL}/auth/o/google-oauth2/?${formBody}`, config);
       

            dispatch({
                type: GOOGLE_AUTH_SUCCESS,
                payload: res.data
            });

            dispatch(load_user());
        } catch (err) {
            dispatch({
                type: GOOGLE_AUTH_FAIL
            });
        }
    }
};


export const signup = (first_name,last_name, email, password, re_password) => async dispatch => {
    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    };

    const body = JSON.stringify({ first_name,last_name, email, password, re_password });
    console.log(body,"from auth in action");

    try {
        console.log("veofre sending auth");
        const res = await axios.post(`${process.env.REACT_APP_API_URL}/auth/users/`, body, config);
        console.log(res,"after sending auth");

        dispatch({
            type: SIGNUP_SUCCESS,
            payload: res.data
        });
    } catch (err) {
        dispatch({
            type: SIGNUP_FAIL
        })
    }
};

export const verify = (uid, token) => async dispatch => {
    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    };

    const body = JSON.stringify({ uid, token });

    console.log("before verify")
    try {
        console.log("before post")
        await axios.post(`${process.env.REACT_APP_API_URL}/auth/users/activation/`, body, config);
        console.log("after psot")
        dispatch({
            type: ACTIVATION_SUCCESS,
        });
    } catch (err) {
        dispatch({
            type: ACTIVATION_FAIL
        })
    }
};

export const reset_password = (email) => async dispatch => {
    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    };

    const body = JSON.stringify({ email });

    try {
        await axios.post(`${process.env.REACT_APP_API_URL}/auth/users/reset_password/`, body, config);

        dispatch({
            type: PASSWORD_RESET_SUCCESS
        });
    } catch (err) {
        dispatch({
            type: PASSWORD_RESET_FAIL
        });
    }
};


export const reset_password_confirm = (uid, token, new_password, re_new_password) => async dispatch => {
    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    };

    const body = JSON.stringify({ uid, token, new_password, re_new_password });

    try {
        await axios.post(`${process.env.REACT_APP_API_URL}/auth/users/reset_password_confirm/`, body, config);

        dispatch({
            type: PASSWORD_RESET_CONFIRM_SUCCESS
        });
    } catch (err) {
        dispatch({
            type: PASSWORD_RESET_CONFIRM_FAIL
        });
    }
};


export const checkAuthenticated = () => async dispatch => {
    if (localStorage.getItem('access')) {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        };

        const body = JSON.stringify({ token: localStorage.getItem('access') });

        try {
            const res = await axios.post(`${process.env.REACT_APP_API_URL}/auth/jwt/verify/`, body, config)

            if (res.data.code !== 'token_not_valid') {
                dispatch({
                    type: AUTHENTICATED_SUCCESS
                });
            } else {
                dispatch({
                    type: AUTHENTICATED_FAIL
                });
            }
        } catch (err) {
            dispatch({
                type: AUTHENTICATED_FAIL
            });
        }

    } else {
        dispatch({
            type: AUTHENTICATED_FAIL
        });
    }
};
export const logout = () => dispatch => {
    dispatch({
        type: LOGOUT
    });
};



export const login = (email, password) => async dispatch => {
    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    };

    const body = JSON.stringify({ email, password });

    try {
        const res = await axios.post(`${process.env.REACT_APP_API_URL}/auth/jwt/create/`, body, config);
        dispatch({
            type: LOGIN_SUCCESS,
            payload: res.data
        });
        dispatch(load_user());
        return null; 
    } catch (err) {
        const errorResponse = err.response.data;
        console.log(errorResponse)
        let errorMessage = 'Login failed. Please try again.';

        if (errorResponse.detail === 'Invalid password.') {
            errorMessage = 'Invalid password.';
        } else if (errorResponse.detail === 'User account not found.') {
            errorMessage = 'User not found. Register to login';
        } else if (errorResponse.detail === 'No active account found with the given credentials') {
            errorMessage = 'Invalid Credentials';
        }

        dispatch({
            type: LOGIN_FAIL
        });

        return errorMessage;
    }
};
