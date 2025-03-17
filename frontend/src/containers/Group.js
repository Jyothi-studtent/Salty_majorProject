import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import axios from 'axios';
import CreateGroup from './Create_group';
import GroupList from './Group_list';
import './css/project.css';
import GroupDropdown from './GroupDropdown';

const Home = ({ user }) => {
  const [isAdmin_Staff, setIsAdmin_Staff] = useState(false);
  const [refreshFlag, setRefreshFlag] = useState(false); // ✅ Track updates

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        console.log("Fetching user details...");
        const response = await axios.get('http://localhost:8000/djapp/get_user_details/', {
          params: { email: user.email }
        });
        if (response.status === 200) {
          const data = response.data;
          setIsAdmin_Staff(data.is_staff);
          console.log("is_staff:", data.is_staff);
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

  // ✅ Function to trigger a refresh of the group list
  const refreshGroupList = () => {
    setRefreshFlag((prev) => !prev);
  };

  return (
    <div className='group'>
      {console.log(isAdmin_Staff)}
      {isAdmin_Staff ? <CreateGroup onGroupCreated={refreshGroupList} /> : <></>}
      <GroupList refreshFlag={refreshFlag} />
     
    </div>
  );
};

const mapStateToProps = (state) => ({
  user: state.auth.user,
});

export default connect(mapStateToProps)(Home);
