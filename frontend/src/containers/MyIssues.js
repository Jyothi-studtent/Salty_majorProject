import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import axios from 'axios';
import IssueCard from '../components/IssueCard';
import DisplayIssueFilters from './DisplayIssueFilters';
import DisplayIssueFiltersWithoutPop from './DisplayIssueFiltersWithoutPop';
import Comment from './Comment';
import IssueCardHorizontal from './IssueCardHorizontal';
import './css/FiltersCss.css';
import Scroll from '../components/Scroll';
import Sidebar from "../components/Sidebar"
import ProjectPage from './ProjectPage';
import AddTeamMembers from './Add_team_members';

function MyIssues({ user, isSidebarCollapsed }) {
  const [selectedProject, setSelectedProject] = useState('');
  const [projects, setProjects] = useState([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [data, setData] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('assigned_to_me');
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [viewType, setViewType] = useState('detailed');

  useEffect(() => {
    if (!user || !user.email) return;
    const fetchProjects = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/djapp/project_list/?email=${user.email}`);
        setProjects(response.data || []);
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };
    fetchProjects();
  }, [user]);

  useEffect(() => {
    if (!user || !user.email) return;
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/djapp/filters_function/`, {
          params: {
            filter: selectedFilter,
            status: '',
            projectid: selectedProject,
            currentUser: user.email
          }
        });
        setData(response.data);
      } catch (error) {
        console.error("There was an error fetching the data!", error);
      }
    };
    fetchData();
  }, [selectedFilter, selectedProject, user]);

  if (!user) {
    return <div>Loading...</div>;
  }

  const setProjectFunction = (e) => {
    const projectId = e.target.value;
    setSelectedProject(projectId);
    setSelectedFilter(projectId !== 'allprojects' ? 'assigned_to_me' : 'allprojects');
  };

  const toggleView = () => {
    setViewType(viewType === 'detailed' ? 'card' : 'detailed');
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
  };

  return (
    <>
    <Sidebar />

    <ProjectPage/>
    <div className='main-component'>
    <div className='tea-time'>
        <ProjectPage/>
        <AddTeamMembers />
        </div>
      <div className='headers-for-filters top-component'>
        <button onClick={() => { toggleView(); setSelectedIssue(''); }} className='toggleButton'>


          {viewType === 'detailed' ? 'List View' : 'Detailed View'}</button>



        <select className='project-dropdown' value={selectedProject} onChange={setProjectFunction} >
          <option value="">Choose project</option>
          <option value="allprojects">All Projects</option>
          {Array.isArray(projects) && projects.length > 0 && projects.map((project) => (
            <option key={project.projectid} value={project.projectid}>
              {project.projectname}
            </option>
          ))}
        </select>
      </div>
      <div className='bottom-component'>
        {viewType === 'detailed' ? (
          <div className='display-container'>
            <div className="issue-cards-container">
              {Array.isArray(data) && data.length > 0 ? (
                data.map(item => (
                 
                  <IssueCard key={item.issue_id} issue={item} onClick={() => { setSelectedIssue(item); setIsPopupOpen(true); }} />
                 
                ))
              ) : (
                <h4>No issues found</h4>
              )}
            </div>
            <div className='info-display-container'>
              {selectedIssue ? (
                <Scroll>
                  <DisplayIssueFiltersWithoutPop data={selectedIssue} />
                  <Comment data={selectedIssue} />
                </Scroll>
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
              <div className="details-myissues">
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
                <IssueCardHorizontal key={item.issue_id} issue={item} onClick={() => { setSelectedIssue(item); setIsPopupOpen(true); }} />
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
              <Scroll>
                <DisplayIssueFilters data={selectedIssue} />
                <Comment data={selectedIssue} />
              </Scroll>
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
}

const mapStateToProps = state => ({
  user: state.auth.user
});

export default connect(mapStateToProps)(MyIssues);


