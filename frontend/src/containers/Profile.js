import React, { useState, useEffect } from 'react';
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

  const [isEditing, setIsEditing] = useState({
    first_name: false,
    last_name: false,
    usn: false,
    phone_number: false,
  });

  const [errorMessage, setErrorMessage] = useState('');

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

  const handleEditClick = (field) => {
    setIsEditing({ ...isEditing, [field]: true });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let errorMessage = '';

    // Validate USN format
    if (name === 'usn') {
      const usnPattern = /^1MS\d{2}CS\d{3}$/;
      if (!usnPattern.test(value)) {
        errorMessage = 'USN should begin with 1MS followed by 2 digits, then CS followed by 3 digits';
      }
    }

    // Validate phone number format
    if (name === 'phone_number') {
      const phoneNumberPattern = /^\d{10}$/;
      if (!phoneNumberPattern.test(value)) {
        errorMessage = 'Phone number should consist of 10 digits';
      }
    }

    // Update state with the new value and error message
    setProfileData({ ...profileData, [name]: value });
    setErrorMessage(errorMessage);
  };

  const handleSubmit = async (e, field) => {
    e.preventDefault();

    // Check if there are any error messages
    if (errorMessage) {
      // Display error message and prevent submission
      console.error('Invalid input:', errorMessage);
      return;
    }

    try {
      const response = await axios.put(
        'http://localhost:8000/djapp/update_user_profile/',
        { ...profileData, email: user.email },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      setProfileData(response.data);
      setIsEditing({ ...isEditing, [field]: false });
    } catch (error) {
      console.error('Error updating profile data:', error);
    }
  };

  return (
    <>
      <div className="profile-container">
        <div className='left-side-profile' style={{ backgroundColor: profileData.color }}>
          {profileData.first_letter}
        </div>
        <div className='right-side-profile'>
          <div className="profile-field">
            <label htmlFor="first_name">First Name:</label>
            {isEditing.first_name ? (
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={profileData.first_name}
                onChange={handleChange}
                onBlur={(e) => handleSubmit(e, 'first_name')}
                onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e, 'first_name')}
              />
            ) : (
              <>
                <span className="editable" onDoubleClick={() => handleEditClick('first_name')}>{profileData.first_name}</span>
                <FaRegEdit onClick={() => { handleEditClick('first_name') }} />
              </>
            )}
          </div>
          <div className="profile-field">
            <label htmlFor="last_name">Last Name:</label>
            {isEditing.last_name ? (
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={profileData.last_name}
                onChange={handleChange}
                onBlur={(e) => handleSubmit(e, 'last_name')}
                onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e, 'last_name')}
              />
            ) : (
              <>
                <span className="editable">{profileData.last_name}</span>
                <FaRegEdit onClick={() => { handleEditClick('last_name') }} />
              </>
            )}
          </div>
          <div className="profile-field">
            <label htmlFor="email">Email:</label>
            <span>{profileData.email}</span>
          </div>
          <div className="profile-field">
            <label htmlFor="usn">USN:</label>
            {isEditing.usn ? (
              <>
                <input
                  type="text"
                  id="usn"
                  name="usn"
                  value={profileData.usn}
                  onChange={handleChange}
                  onBlur={(e) => handleSubmit(e, 'usn')}
                  onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e, 'usn')}
                />
                {errorMessage && <span className="error-message">{errorMessage}</span>}
              </>
            ) : (
              <>
                <span className="editable" onDoubleClick={() => handleEditClick('usn')}>{profileData.usn}</span>
                <FaRegEdit onClick={() => { handleEditClick('usn') }} />
              </>
            )}
          </div>

          <div className="profile-field">
            <label htmlFor="phone_number">Phone Number:</label>
            {isEditing.phone_number ? (
              <input
                type="text"
                id="phone_number"
                name="phone_number"
                value={profileData.phone_number}
                onChange={handleChange}
                onBlur={(e) => handleSubmit(e, 'phone_number')}
                onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e, 'phone_number')}
              />
            ) : (
              <>
                <span className="editable" onDoubleClick={() => handleEditClick('phone_number')}>{profileData.phone_number}</span>
                <FaRegEdit onClick={() => { handleEditClick('phone_number') }} />
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

const mapStateToProps = (state) => ({
  user: state.auth.user,
});

export default connect(mapStateToProps)(Profile);
