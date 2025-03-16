import React from 'react';
import { AiFillCaretRight, AiOutlineProject, AiOutlineTeam, AiOutlineBarChart } from "react-icons/ai";
import './css/Hpage.css';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { connect } from 'react-redux';

const Home = ({ isAuthenticated }) => {
  const navigate = useNavigate();

  const handleLoginButton = () => {
    navigate('/login');
  };

  return (
    <>
      <section className="intro-container">
        {!isAuthenticated ? (
          <div className="content">
            <h3 className='welcome-header'>WELCOME TO</h3>
            <div className='salty-header'>
              <h1>S</h1>
              <h1>A</h1>
              <h1>L</h1>
              <h1>T</h1>
              <h1>Y</h1>
            </div>
            <div className="button-div">
              <button type="button" className="continue-to-login" onClick={handleLoginButton}>
                <AiFillCaretRight className="apple-icon" />
                Continue to Use
              </button>
            </div>
          </div>
        ) : (
          <Navigate to={`/group`} />
        )}
      </section>
      <section className='card-container'>
        <div className="card">
          <div className="card-header">
            <AiOutlineProject className="card-icon" />
            <h3>Project Management</h3>
          </div>
          <p>Plan, track, and manage your projects with ease.</p>
        </div>
        <div className="card">
          <div className="card-header">
            <AiOutlineTeam className="card-icon" />
            <h3>Collaboration</h3>
          </div>
          <p>Communicate and work together effectively.</p>
        </div>
        <div className="card">
          <div className="card-header">
            <AiOutlineTeam className="card-icon" />
            <h3>Easy to use</h3>
          </div>
          <p>Simple and easy to use with almost no getting used to.</p>
        </div>
        <div className="card">
          <div className="card-header">
            <AiOutlineBarChart className="card-icon" />
            <h3>Analytics</h3>
          </div>
          <p>Gain insights into project performance.</p>
        </div>
      </section>
      <section className='short-container'>
        <div className='rhs'>
          <h1><strong>A Revolutionary tool</strong></h1><br/>
          <h3><strong>For effective and collaborative project <br/>Management for Dept-CSE MSRIT</strong></h3>
        </div>
        {/* Uncomment and update the images if needed */}
        {/* <div className='lhs'>
          <img className='up-right-align' src='./1.png' alt='Image 1' />
          <img className='down-left-align' src='./2.png' alt='Image 2' />
          <img className='up-right-align' src='./3.png' alt='Image 3' />
          <img className='down-left-align' src='./4.png' alt='Image 4' />
        </div> */}
      </section>
      <section className='contact-container'>
        <h3>Developer Contact</h3>
        <p>Team:<br /> Charishma <br />Kavya <br /> Jyoti<br /> </p>
        <p>Email: chekavjyo@gmail.com</p>
        <p>Phone: (123) 456-7890</p>
      </section>
    </>
  );
};

const mapStateToProps = state => ({
  isAuthenticated: state.auth.isAuthenticated
});

export default connect(mapStateToProps)(Home);
