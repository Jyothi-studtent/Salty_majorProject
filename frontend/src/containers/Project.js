
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import axios from 'axios';
import Create_project from './Create_project';
import Project_list from './Project_list';
import './css/project.css';

const Home = ({ user }) => {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        console.log("Fetching user details...");
        const response = await axios.get('http://localhost:8000/djapp/get_user_details/', {
          params: { email: user.email }
        });
        if (response.status === 200) {
          const data = response.data;
          setIsAdmin(data.is_admin);
          console.log("is_admin:", data.is_admin);
        } else {
          console.error('Error fetching user details:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };

    if (user && user.email) {
      fetchUserDetails();
    }
  }, [user]);

  return (
    <div className='project'>
      {console.log(isAdmin)}
      {isAdmin ? <Create_project /> : <></>}
      <Project_list />
    </div>
  );
};

const mapStateToProps = (state) => ({
  user: state.auth.user,
});

export default connect(mapStateToProps)(Home);


