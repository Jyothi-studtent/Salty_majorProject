
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import axios from 'axios';
import Create_project from './Create_project';
import Project_list from './Project_list';

import './css/project.css';
import CompulsoryIssues from './CompulsoryIssues';

const Home = ({ user }) => {
  const [isAdmin_Staff, setisAdmin_Staff] = useState(false);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        console.log("Fetching user details...");
        const response = await axios.get('http://localhost:8000/djapp/get_user_details/', {
          params: { email: user.email }
        });
        if (response.status === 200) {
          const data = response.data;
          setisAdmin_Staff(data.is_staff);
          console.log("is_staff:", data.is_staff);
        } else {
          console.error('Error fetching user details:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
        let errorMessage = "Error fetching user details:";

      if (error.response) {
          errorMessage = error.response.data.error || "Something went wrong.";
      } else if (error.request) {
          errorMessage = "No response from server. Check your internet connection.";
      }

      alert(errorMessage);
      }
    };

    if (user && user.email) {
      fetchUserDetails();
    }
  }, [user]);

  return (
    <div className='project'>
      {console.log(isAdmin_Staff)}
      {isAdmin_Staff ? <Create_project /> : <></>}
      {isAdmin_Staff ? <CompulsoryIssues /> : <></>}
      <Project_list />
    </div>
  );
};

const mapStateToProps = (state) => ({
  user: state.auth.user,
});

export default connect(mapStateToProps)(Home);


