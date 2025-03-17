import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { connect } from 'react-redux';
import axios from 'axios';
import IssueCard from '../components/IssueCard';
import DisplayIssueFilters from './DisplayIssueFilters';
import './css/FiltersCss.css';
import DisplayIssueFiltersWithoutPop from './DisplayIssueFiltersWithoutPop';
import Comment from './Comment';
import IssueCardHorizontal from './IssueCardHorizontal';
import CScroll from './CScroll';
import Sidebar from "../components/Sidebar";
import ProjectPage from './ProjectPage';
import AddTeamMembers from './Add_team_members';

const Filters = ({ isAuthenticated, user, isSidebarCollapsed }) => {
  const { projectid } = useParams();
  const [selectedFilter, setSelectedFilter] = useState('all_issues');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentUser, setCurrentUser] = useState('');
  const [data, setData] = useState([]);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [viewType, setViewType] = useState('detailed');
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');

  useEffect(() => {
    if (isAuthenticated && user) {
      setCurrentUser(user.email);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/djapp/filters_function/`, {
          params: {
            filter: selectedFilter,
            status: selectedFilter === 'Status' ? statusFilter : '',
            projectid: projectid,
            currentUser: currentUser
          }
        });

        setData(response.data);
      } catch (error) {
        console.error("There was an error fetching the data!", error);
        let errorMessage = "There was an error fetching the data!";

        if (error.response) {
          errorMessage = error.response.data.error || "Something went wrong.";
        } else if (error.request) {
          errorMessage = "No response from server. Check your internet connection.";
        }

        alert(errorMessage);
      }
    };

    fetchData();
  }, [selectedFilter, statusFilter, projectid, currentUser]);

  const toggleView = () => {
    setViewType(viewType === 'detailed' ? 'card' : 'detailed');
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
  };

  // const fetchCompletedIssues = async () => {
  //   try {
  //     const response = await axios.get(`http://localhost:8000/djapp/filters_function/`, {
  //       params: {
  //         filter: 'my_issues',
  //         currentUser: currentUser
  //       }
  //     });
  //     setProjects(response.data);
  //   } catch (error) {
  //     console.error("Error fetching projects:", error);
  //     alert("Error fetching projects.");
  //   }
  // };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/djapp/filters_function/`, {
          params: {
            filter: selectedFilter,
            status: selectedFilter === 'Status' ? statusFilter : '',
            projectid: selectedFilter === 'my_issues' ? selectedProject : projectid,
            currentUser: currentUser
          }
        });
  
        setData(response.data);
      } catch (error) {
        console.error("There was an error fetching the data!", error);
        alert("Error fetching data.");
      }
    };
  
    if (selectedFilter !== 'my_issues' || (selectedFilter === 'my_issues' && selectedProject)) {
      fetchData();
    }
  }, [selectedFilter, statusFilter, projectid, currentUser, selectedProject]);
  

  return (
    <>
      <Sidebar />
      <div className='main-component'>
        <div className='headers-for-filters top-component'>
          <div className='tea-time'>
            <ProjectPage />
            <AddTeamMembers />
          </div>
          <button onClick={() => { toggleView(); setSelectedIssue(''); }} className='toggleButton'>{viewType === 'detailed' ? 'List View' : 'Detailed View'}</button>
          <select
            value={selectedFilter}
            className='project-dropdown'
            onChange={(e) => {
              setSelectedFilter(e.target.value);
              if (e.target.value !== 'Status' && e.target.value !== 'complete_issues') {
                setStatusFilter('');
                setSelectedProject('');
              }
              // if (e.target.value === 'complete_issues') {
              //   fetchCompletedIssues()
               
              // }
            }}
          >
            <option value="">Select Filter</option>
            <option value="all_issues">All issues</option>
            <option value="assigned_to_me">Assigned to me</option>
            <option value="Status">Status</option>
            <option value="unassigned">Unassigned</option>
            <option value="complete_issues">completed Issues</option>
          </select>
{/* 
          {selectedFilter === 'my_issues' && projects.length > 0 && (
            <select
              value={selectedProject}
              className='project-dropdown'
              onChange={(e) => setSelectedProject(e.target.value)}
            >
              <option value="">Select Project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
          )} */}


          {selectedFilter === 'Status' && (
            <div>
              <select value={statusFilter} className='project-dropdown-status' onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="">Select Status</option>
                <option value="To-Do">To Do</option>
                <option value="In-Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
            </div>
          )}
        </div>
        <div className='bottom-component'>
          {viewType === 'detailed' ? (
            <div className='display-container'>
              <CScroll>
                <div className="issue-cards-container" style={{ overflowY: 'scroll', border: '1px', scrollbarWidth: 'none', }}>
                  {Array.isArray(data) && data.length > 0 ? (
                    data.map(item => (
                      <IssueCard key={item.issue_id} issue={item} onClick={() => { setSelectedIssue(item); setIsPopupOpen(true); }} />
                    ))
                  ) : (
                    <h4>No issues found</h4>
                  )}
                </div>
              </CScroll>

              <div className='info-display-container'>
                {selectedIssue ? (
                  <CScroll>
                    <DisplayIssueFiltersWithoutPop data={selectedIssue} />
                    <Comment data={selectedIssue} />
                  </CScroll>
                ) : (
                  <div className="nothing-displayed">
                    <h6>Select an Issue</h6>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div>
              <div className="issue-card-horizontal-myissues">
                <div className="details-myissues" >
                  <span className="issue-type">Type</span>
                  <span className="issue-name">Name</span>
                  <span className="description">Summary</span>
                  <span className="assigned-by">Assigned by</span>
                  <span className="status">Status</span>
                  <span className="assignee">Assignee</span>
                  <span className='prority'>Priority</span>
                </div>
              </div>
              {Array.isArray(data) && data.length > 0 ? (
                data.map(item => (
                  <IssueCardHorizontal key={item.issue_id} issue={item}
                    onClick={() => { setSelectedIssue(item); setIsPopupOpen(true); }} />
                ))
              ) : (
                <h4>No issues found</h4>
              )}
            </div>
          )}
          {viewType === 'card' && isPopupOpen && selectedIssue && (
            <div className="popup">
              <div className="popup-content">
                <button className="close-button" onClick={handleClosePopup}>X</button>
                <CScroll>
                  <DisplayIssueFilters data={selectedIssue} />
                  <Comment data={selectedIssue} />
                </CScroll>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

const mapStateToProps = (state) => ({
  isAuthenticated: state.auth.isAuthenticated,
  user: state.auth.user,
});

export default connect(mapStateToProps)(Filters);


