import React, { Fragment, useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { connect } from 'react-redux';
import { logout } from '../actions/auth';
import { GoPersonFill } from "react-icons/go";
import './css/navbar.css';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import IssueForm from '../containers/IssueForm';

const Navbar = ({ logout, isAuthenticated, user }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [projects, setProjects] = useState([]);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const { group_id, projectid } = useParams();
    const [formOpen, setFormOpen] = useState(false);
  

    useEffect(() => {
        if (user) {
            const fetchProjects = async () => {
                try {
                    const response = await axios.get(`http://localhost:8000/djapp/project_list/?email=${user.email}&group_id=${group_id}`);
                    // const response = await axios.get('http://localhost:8000/djapp/project_list/', {
                    //     params: { email: user.email, group_id: group_id  }
                    // });
                    setProjects(response.data);
                } catch (error) {
                    console.error('Error fetching projects:', error);
                    let errorMessage = "There was an error fetching the data!";

        if (error.response) {
            errorMessage = error.response.data.error || "Something went wrong.";
        } else if (error.request) {
            errorMessage = "No response from server. Check your internet connection.";
        }
  
        alert(errorMessage);
                }
            };

            fetchProjects();
        }
    }, [user]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const logoutUser = () => {
        logout();
        navigate('/'); 
    };

    const guestLinks = () => (
        <Fragment>
            <li className='nav-item'>
                <Link className='nav-link' to='/login'>
                    Login
                </Link>
            </li>
            <li className='nav-item'>
                <Link className='nav-link' to='/signup'>
                    Sign Up
                </Link>
            </li>
        </Fragment>
    );

    const authLinks = () => (
        <Fragment>
            <li className='nav-item'>
                <a className='nav-link' href='#!' onClick={logoutUser}>
                    Logout
                </a>
            </li>
        </Fragment>
    );

    const openProfile = () => {
        navigate(`/group/${group_id}/project/${projectid}/profile`);
    };

    const openMyIssues = () => {
        navigate(`/group/${group_id}/project/${projectid}/filters`);
    };

    const openViewAllProjects = () => {
        navigate(`/group/${group_id}/project`, { replace: true }); 
        window.location.reload();
    };

    const openForm = () => {
        setFormOpen(true);
    };

    const closeForm = () => {
        setFormOpen(false);
    };

    return (
        <Fragment>
            <nav className='nav-container'>
                <ul className='nav-list'>
                    <li className='nav-item'>
                        <button className='nav-button'>Salty</button>
                    </li>
                    <li className='nav-item'>
                        <button className='nav-button' onClick={toggleDropdown}>Project</button>
                        {isDropdownOpen && (
                            <ul className='dropdown' ref={dropdownRef}>
                                {projects.map(project => (
                                    <li key={project.projectid}>
                                        <Link to={`/group/${project.group_id}/project/${project.projectid}/backlog`} className='dropdown-item'>{project.projectname}</Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </li>

                    {isAuthenticated ? authLinks() : guestLinks()}

                    {isAuthenticated && (
                        <Fragment>
                            <button className='nav-button-create' onClick={openForm}>Create Issue</button>
                        </Fragment>
                    )}

                    {formOpen && (
                        <div className="modal">
                            <div className="modal-content">
                                <span className="close" onClick={closeForm}>&times;</span>
                                <IssueForm onClose={closeForm} />
                            </div>
                        </div>
                    )}
                </ul>

                {isAuthenticated && user && (
                    <ul className='nav-list'>
                        <li className='nav-item'>
                            <p className='admin_user'>{user.is_admin ? 'Admin' : 'User'}</p>
                        </li>
                    </ul>
                )}

                {isAuthenticated && user && (
                    <ul className='nav-list'>
                        <li className='nav-item'>
                            <button onClick={openProfile} className='person'><GoPersonFill /></button>
                        </li>
                    </ul>
                )}

            </nav>
        </Fragment>
    );
};

const mapStateToProps = state => ({
    isAuthenticated: state.auth.isAuthenticated,
    user: state.auth.user
});

export default connect(mapStateToProps, { logout })(Navbar);
