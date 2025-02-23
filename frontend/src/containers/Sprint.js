import React, { useState, useEffect, useRef } from 'react';
import { useNavigate,useParams } from 'react-router-dom';
import SprintForm from "./SprintForm";
import './css/backlog.css';
import { connect } from 'react-redux';
import { RiArrowDropDownLine } from "react-icons/ri";
import { RiArrowDropUpLine } from "react-icons/ri";
import IssueType from './issuseType';
import Backlog from './Backlog';
import axios from 'axios';
import { FaPencilAlt } from 'react-icons/fa';
import { useDrop } from 'react-dnd';

const Sprint = ({ sprint, fetchData, onSprintDelete, setissueDragged = null, onissueTypeChange,toggleTrigger }) => {
  const { projectid } = useParams();
  const [action,setActions]=useState("");
  const [issues, setIssues] = useState([]);
  const [issueStatusChanged, setIssueStatusChanged] = useState(false);
  const [buttonType, setButtonType] = useState(sprint.status);
  const [showDropdown, setShowDropdown] = useState(false);
  const [InputField, setInputField] = useState(false);
  const [buttonShow, setButtonShow] = useState(true);
  const [selectedSprintData, setSelectedSprintData] = useState(null);
  const [backlogsListOpen, setBacklogsListOpen] = useState(true);
  const [showSprintForm, setShowSprintForm] = useState(false);
  const navigate = useNavigate();

  const dropdownRef = useRef(null);
  const fetchIssues = async () => {
    try {
     
      const response = await axios.get("http://localhost:8000/djapp/issuesOfSprint/", {
        params: { projectId: projectid, sprintName: sprint.sprint }
      });
      setIssues(response.data);
      setIssueStatusChanged(false);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
   
    fetchIssues();
  }, [projectid, issueStatusChanged,toggleTrigger]);

  const handleEditSprint = (action) => {
    setSelectedSprintData(sprint);
    if(showDropdown){
    setShowDropdown(false)}
    setActions(action)
    setShowSprintForm(true);
  };

  const handleSprintForm = async () => {
    if (buttonType === 'start') {
      setActions('start')
      setButtonType('complete');
      const response = await axios.get("http://localhost:8000/djapp/updateSprintStatus/", {
        params: { projectId: projectid, sprintName: sprint.sprint,status:"complete" }
      });
      
      navigate(`/project/${projectid}/boards?sprintName=${encodeURIComponent(sprint.sprint)}`);
    } else {
      const allIssuesDone = issues.every(issue => issue.status === 'Done');
      if (allIssuesDone) {
        const confirmComplete = window.confirm("This sprint is completed. Well done! Do you want to complete it?");
        if (confirmComplete) {
          const response = await axios.get("http://localhost:8000/djapp/updateSprintStatus/", {
            params: { projectId: projectid, sprintName: sprint.sprint,status:"completed" }
          });
          onSprintDelete(true);
        }
      } else {
        alert("Please complete all issues before completing the sprint.");
      }
    }
  };

  const receiveFormDataFromChild = (data) => {
    const SprintFormData = data;
  };

  const toggleSprintList = () => {
    setBacklogsListOpen(!backlogsListOpen);
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleDeleteSprint = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete this sprint?");
    if (confirmDelete) {
      try {
        await axios.get("http://localhost:8000/djapp/delete_sprint/", {
          params: { projectId: projectid, sprintName: sprint.sprint }
        });
        onissueTypeChange(true);
        fetchData()
       
      } catch (error) {
        console.error("Error deleting sprint:", error);
        alert("Failed to delete sprint");
      }
    } else {
      setShowDropdown(false);
    }
  };

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'ISSUE',
    drop: async (item) => {
      setIssues((prevIssues) => [...prevIssues, item.issue]);
      await axios.post('http://localhost:8000/djapp/update_issueSprint/', { issue: item.issue.IssueName, sprint: sprint.sprint, projectId: projectid });
     

      onissueTypeChange(true);
      toggleTrigger();
      // setIssueStatusChanged(true);
      // setissueDragged(true);
      // fetchIssues();
      
      
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  const shouldShowPencilIcon = !sprint.start_date || !sprint.end_date;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  // Function to format date in "D Month" format
  const formatDateRange = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
   
    const startDay = start.getDate();
    const startMonth = start.toLocaleString('default', { month: 'short' });

    const endDay = end.getDate();
    const endMonth = end.toLocaleString('default', { month: 'short' });

    return `${startDay} ${startMonth} - ${endDay} ${endMonth}`;
  };

  return (
    <div ref={drop} className='sprint-first'>
      {showSprintForm && (
        <SprintForm
          closeForm={setShowSprintForm}
          sendDataToParent={receiveFormDataFromChild}
          initialFormData={selectedSprintData}
          onSprintDelete={onSprintDelete}
          closeDropDown={setShowDropdown}
          setButtonType={setButtonType}
          sprintName={sprint.sprint}
          action={action}
         
        />
      )}
      <div className="mainBox">
        <div  className={backlogsListOpen ? "sprint-detailsopen" : "sprint-details"}>
          <div className="left-section">
            <button className="react-icon" onClick={toggleSprintList}>
              {backlogsListOpen ? <RiArrowDropUpLine /> : <RiArrowDropDownLine />}
            </button>
            <div className='chotadabba1'>{sprint.sprintName}</div>
            <div className='DATE'>
              <div className='chotadabba'>
                {shouldShowPencilIcon ? (
                  <div className='pencilIcon'onClick={() => handleEditSprint('add dates')} >
                    <FaPencilAlt  className="pen-icon"/>
                    <p className='addDates' >Add dates</p>
                  </div>
                ) : (
                  formatDateRange(sprint.start_date, sprint.end_date)
                )}
              </div>
            </div>
          </div>
          <div className="right-section" ref={dropdownRef}>
            <div>
              {issues.length > 0 && (
                <button className="button-sprint" onClick={handleSprintForm}>
                  {buttonType === 'start' ? "Start Sprint" : "Complete Sprint"}
                </button>
              )}
            </div>
            <div className="dropdownC">
              <button className="Dropdown" onClick={toggleDropdown}>...</button>
            </div>
            {showDropdown && (
              <div className="Dropdown-Content">
               
                <span onClick={() => handleEditSprint('edit')}>Edit</span>


                <span onClick={handleDeleteSprint}>Delete</span>
              </div>
            )}
          </div>
        </div>
        {backlogsListOpen && <Backlog issuesList={issues} sprint_name={sprint.sprint} onissueTypeChange={setIssueStatusChanged}  />}
      </div>
    </div>
  );
};

const mapStateToProps = (state) => ({
  token: state.auth.access,
});

export default connect(mapStateToProps)(Sprint);


