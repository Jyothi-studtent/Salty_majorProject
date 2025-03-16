import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { connect } from 'react-redux';
import './css/profile.css';
import { FaRegEdit } from "react-icons/fa";

const Profile = ({ user }) => {
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    usn: '',
    phone_number: '',
    color: '',
    first_letter: '',
  });

  const [editField, setEditField] = useState(null);
  const [tempData, setTempData] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('http://localhost:8000/djapp/get_user_profile/', {
          params: { email: user.email }
        });
        setProfileData(response.data);
      } catch (error) {
        console.error('Error fetching profile data:', error);
      }
    };

    fetchProfile();
  }, [user.email]);

  const validateField = useCallback((name, value) => {
    let errorMessage = '';

    if (name === 'usn') {
      const usnPattern = /^1MS\d{2}CS\d{3}$/;
      if (!usnPattern.test(value)) {
        errorMessage = 'USN should begin with 1MS followed by 2 digits, then CS followed by 3 digits';
      }
    }

    if (name === 'phone_number') {
      const phonePattern = /^\d{10}$/;
      if (!phonePattern.test(value)) {
        errorMessage = 'Phone number should consist of 10 digits';
      }
    }

    setErrors(prev => ({ ...prev, [name]: errorMessage }));
  }, []);

  const handleEditClick = (field) => {
    setEditField(field);
    setTempData({ ...profileData });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTempData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleSave = async (field) => {
    if (errors[field]) return; // Prevent saving if there are validation errors

    try {
      const response = await axios.put(
        'http://localhost:8000/djapp/update_user_profile/',
        { ...tempData, email: user.email },
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );

      // Preserve color and first_letter while updating data
      setProfileData(prev => ({
        ...response.data,
        color: prev.color, 
        first_letter: prev.first_letter
      }));

      setEditField(null);
    } catch (error) {
      console.error('Error updating profile data:', error);
    }
  };

  const handleCancel = () => {
    setTempData({ ...profileData });
    setEditField(null);
    setErrors({});
  };

  return (
    <div className="profile-container">
      {/* Ensure the profile image stays even when editing */}
      <div className='left-side-profile' style={{ backgroundColor: profileData.color }}>
        {profileData.first_letter}
      </div>
      
      <div className='right-side-profile'>
        {['first_name', 'last_name', 'usn', 'phone_number'].map((field) => (
          <div key={field} className="profile-field">
            <label htmlFor={field}>{field.replace('_', ' ').toUpperCase()}:</label>
            <div className="input-container">
              {editField === field ? (
                <>
                  <input
                    type="text"
                    id={field}
                    name={field}
                    value={tempData[field] || ''}
                    onChange={handleChange}
                  />
                  {errors[field] && <div className="error-message">{errors[field]}</div>}
                  <div className="button-container">
                    <button className="save-btn" onClick={() => handleSave(field)}>Save</button>
                    <button className="cancel-btn" onClick={handleCancel}>Cancel</button>
                  </div>
                </>
              ) : (
                <>
                  <span className="editable" onDoubleClick={() => handleEditClick(field)}>
                    {profileData[field]}
                  </span>
                  <FaRegEdit onClick={() => handleEditClick(field)} />
                </>
              )}
            </div>
          </div>
        ))}
        
        <div className="profile-field">
          <label>EMAIL:</label>
          <span>{profileData.email}</span>
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state) => ({
  user: state.auth.user,
});

export default connect(mapStateToProps)(Profile);