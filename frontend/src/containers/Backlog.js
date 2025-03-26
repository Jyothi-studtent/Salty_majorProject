import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import './css/sprint.css';
import AssigneeSelector from './AssigneeSelector';
import DisplayIssueFilters from './DisplayIssueFilters';
import Modal from './modal';
import { v4 as uuidv4 } from 'uuid';
import { FaPlus } from "react-icons/fa6";
import IssueType from './issuseType';
import { connect } from 'react-redux';
import { FaUser } from 'react-icons/fa';
import axios from 'axios';
import { addIssue } from '../actions/auth';
import IssueStatus from './issueStatus';
import IssueStorypoints from './storypoints';
import { useDrag,useDrop } from 'react-dnd';
import { SiStorybook } from "react-icons/si";
import { FaBug } from 'react-icons/fa';
import { FaTasks } from "react-icons/fa";
import BoardsIssueDisplay from './BoardsIssueDisplay';
import { FaRegTrashAlt } from "react-icons/fa";
import { FaPencilAlt } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import useDragScrolling from "./useDragScrolling";


const Backlog = ({ addIssue, issuesList = [], sprint_name, onissueTypeChange }) => {
  const [showInputField, setShowInputField] = useState(false);
  const [selectedIssueType, setSelectedIssueType] = useState('Story');

  const { projectid } = useParams();
  const inputContainerRef = useRef(null);
  const scrollRef = useRef(null); 
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (event) => {
    
    setIsDragging(true);
    
   
  // document.addEventListener('mousemove', handleMouseMove);
  
//   document.addEventListener('mouseup', handleDragEnd);
//  console.log("insideeeeeeeeeeeeeeeeeee drag start")
  };
  
 

  const handleDragEnd = () => {
    console.log(isDragging)
    console.log("inside drag end")
    setIsDragging(false);
    // document.removeEventListener('mousemove', handleMouseMove); 
   
    // document.removeEventListener('mouseup', handleDragEnd);
   
  };

  // const handleMouseMove = (event) => {
  
  //   if (isDragging) { 
  //     console.log("mouseeeeeeeeeeeeee moveeeeee")
  //     const scrollSpeed = 20;  
  //     const threshold = 100;  
  //     const { clientY } = event;  
  //     const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

  //     let scrollAmount = 0;

  //     if (clientY < threshold && scrollTop > 0) {
  //         scrollAmount = -scrollSpeed;  
  //     }
  //     else if (clientY > window.innerHeight - threshold && scrollTop + clientHeight < scrollHeight) {
  //         scrollAmount = scrollSpeed;  
  //     }
  
  //     if (scrollAmount !== 0) {
  //         window.scrollBy(0, scrollAmount); // Scroll the page
  //     }
  // }

  // };
  
  
  
    

  const handleClickOutside = (event) => {
    if (inputContainerRef.current && !inputContainerRef.current.contains(event.target) && event.target.className !== "EnterIssue") {
      setShowInputField(false);
    }
  };

  useEffect(() => {
    if (showInputField && scrollRef.current) {
      const scrollElement = scrollRef.current;
      const offset = 100; 
      window.scrollTo({
        top: scrollElement.getBoundingClientRect().top + window.scrollY - offset,
        behavior: 'smooth',
      });
    }
  }, [showInputField]);

  useEffect(() => {
    if (showInputField) {
      document.addEventListener('click', handleClickOutside);
    } else {
      document.removeEventListener('click', handleClickOutside);
    }
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showInputField]);

  const handleCreateIssueClick = () => {
    setShowInputField(true); 
  };

  const handleKeyPress = async (event) => {
    if (event.key === 'Enter') {
      const newIssueName = event.target.value.trim();
      const isDuplicate = issuesList.some(issue => issue.IssueName === newIssueName);
      if (isDuplicate) {
        alert('An issue with this name already exists in the project.');
        return;
      }
      const newIssue = {
        IssueName: newIssueName,
        IssueType: selectedIssueType,
        projectId: projectid,
        sprint: sprint_name,
        assigned_epic: null,
      };
      try {
        await addIssue(newIssue);
        onissueTypeChange(true);
      } catch (error) {
        console.error('Error creating issue:', error);
        const errorMessage = error.payload ? error.payload.error : 'An unexpected error occurred. Please try again later.';
        alert(errorMessage);
      }
      setShowInputField(false); 
      event.target.value = '';
    }
  };

  const handleInputClick = (event) => {
    event.stopPropagation(); 
  };

  return (
    <>
      <div className={issuesList.length ? 'solid-box' : 'dotted-box'}>
        {issuesList.length === 0 ? (
          <div className="empty-message">Create issues to add to our sprint and then start sprint</div>
        ) : (
          issuesList.map((value, index) => {
            return <DraggableIssue  key={uuidv4()} issue={value} projectid={projectid} onissueTypeChange={onissueTypeChange} onDragStart={handleDragStart} onDragEnd={handleDragEnd}  />;
          })
        )}
      </div>
      <div className="create-issue" ref={inputContainerRef}>
        {!showInputField && (
          <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleCreateIssueClick(); }} className='create-btn-Backlogs'>
            <span><FaPlus /></span>
            <span>Create Issue</span>
          </button>
        )}
        {showInputField && (
          <div className="issueCreation" ref={scrollRef} onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
            <IssueType onSelect={setSelectedIssueType} />
            <input
              type="text"
              className="EnterIssue"
              placeholder="Type your issue here"
              onKeyDown={handleKeyPress}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            />
          </div>
        )}
      </div>
    </>
  );
};










const DraggableIssue = ({ issue, projectid, onissueTypeChange, onDragStart, onDragEnd }) => {
  const {
    addEventListenerForWindow,
    removeEventListenerForWindow
  } = useDragScrolling();
  const [{ isDragging, clientOffset }, drag, preview, monitor] = useDrag(() => ({
    type: 'ISSUE',
    item: () => {
      // Trigger the auto-scrolling when dragging begins
      addEventListenerForWindow();

      return { issue };
    },
    end: () => {
      // Cleanup after dragging ends
      removeEventListenerForWindow();
    },
    
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
      clientOffset: monitor.getClientOffset(), // Get the position of the dragged element
    }),
  }));

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'ISSUE',
    drop: () => {
      console.log('Dropped');
       
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));
  // const handleScrollBasedOnDrag = () => {
  //   if (isDragging && clientOffset) {
  //     const { y } = clientOffset;
  //     const scrollSpeed = 10;
  //     const threshold = 50; // Adjust as needed
  
  //     const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
  //     let scrollAmount = 0;
  
  //     // Scroll up if near the top of the window
  //     if (y < threshold && scrollTop > 0) {
  //       scrollAmount = -scrollSpeed;
  //     }
  //     // Scroll down if near the bottom of the window
  //     else if (y > window.innerHeight - threshold && scrollTop + clientHeight < scrollHeight) {
  //       scrollAmount = scrollSpeed;
  //     }
  
  //     // Ensure that scrolling up does not exceed the top
  //     if (scrollTop + scrollAmount < 0) {
  //       scrollAmount = -scrollTop;
  //     }
  
  //     // Ensure scrolling down does not exceed the bottom
  //     if (scrollTop + clientHeight + scrollAmount > scrollHeight) {
  //       scrollAmount = scrollHeight - (scrollTop + clientHeight);
  //     }
  
  //     // If scrollAmount is non-zero, trigger smooth scrolling
  //     if (scrollAmount !== 0) {
  //       window.scrollBy(0, scrollAmount);
  //       requestAnimationFrame(handleScrollBasedOnDrag); // Keep scrolling smoothly
  //     }
  //   }
  // };
  
  
  

  // useEffect(() => {
  //   // Continuously scroll the page while dragging based on the dragged element's position
  //   if (isDragging) {
  //     const scrollInterval = setInterval(handleScrollBasedOnDrag, 50);  // Adjust interval as needed
  //     return () => clearInterval(scrollInterval);  // Clean up when drag ends
  //   }
  // }, [isDragging, clientOffset]);
 

const token = useSelector((state) => state.auth.access);
  const user=useSelector(state => state.auth.user); 
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [dropdownEpics, setDropdownEpics] = useState(false);
  const [Epics, setEpics] = useState([]);
  const [selectedEpic, setSelectedEpic] = useState(issue.assigned_epic ? issue.assigned_epic.EpicName : null);
  const [editedIssueName, setEditedIssueName] = useState(issue.IssueName);
  const [assigneeOptions, setAssigneeOptions] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const togglePopup = () => {
    setShowPopup(!showPopup);
  };
  
  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const teamMembersResponse = await axios.get(`http://localhost:8000/djapp/get_assignee/?projectid=${projectid}`);
      
        setAssigneeOptions(teamMembersResponse.data.team_members);
      } catch (error) {
        console.error('Error fetching team members and sprints:', error);
        let errorMessage = "Failed to load team members. Please try again later.";

            if (error.response) {
                errorMessage = error.response.data.error || "Something went wrong.";
            } else if (error.request) {
                errorMessage = "No response from server. Check your connection.";
            }

            alert(errorMessage);  // Show error in an alert (replace with better UI if needed)
       
      }
    };
    fetchTeamMembers();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownVisible && !event.target.closest('.assignee-container')) {
        setDropdownVisible(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [dropdownVisible]);



  const getIssueIcon = (issueType) => {
    switch (issueType) {
      case 'Bug':
        return <FaBug />;
      case 'Task':
        return <FaTasks />;
      default:
        return <SiStorybook />;
    }
  };

  // const handleSelectEpic = async (epic) => {
  //   setSelectedEpic(epic);
  //   setDropdownEpics(!dropdownEpics);
  //   try {
  //     const response = await axios.post('http://localhost:8000/djapp/update_issueepic/', { issue: issue.IssueName, epic: epic, projectId: projectid });
  //   } catch (error) {
  //     console.error('Error updating issue epic:', error);
  //   }
  // };

  const handleDeleteIssue = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete this issue?");
    if (confirmDelete) {
      try {
        const response = await axios.get("http://localhost:8000/djapp/delete_issue/", {
          params: { projectId: projectid, issueName: issue.IssueName }
        });
        alert("Issue deleted successfully");
        onissueTypeChange(true);
      } catch (error) {
        console.error("Error deleting issue:", error);
        alert("Failed to delete issue");
      }
    }
  };

  const handleInputBlur = () => {
    setIsEditing(false);
  };

  const handleInputChange = (event) => {
    setEditedIssueName(event.target.value);
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };
  const handleAssigneeChange = (newAssignee) => {
    console.log(`Assignee changed to: ${newAssignee}`);
    // Add your logic here to handle the assignee change, if needed
  };


  const handleInputKeyDown = async (event) => {
    if (event.key === 'Enter') {
      console.log("object",issue)
      handleInputBlur();
      try {
        const response = await axios.post("http://localhost:8000/djapp/update_issue_name/", {
          projectId: projectid,
          oldIssueName: issue.IssueName,
          newIssueName: editedIssueName,
        },
        {
          headers: {
            Authorization: `JWT ${token}`, 
            "Content-Type": "application/json",
          },
        }
      );
        onissueTypeChange(true);
      } catch (error) {
        console.error("Error updating issue name:", error);
        alert("Failed to update issue name");
      }
    }
  };

  return (
    <div className="scroll-container">
    <div className="input-item" ref={(node) => drag(drop(node))} style={{ opacity: isDragging ? 0.5 : 1 }} onClick={togglePopup} >
      <div className='left-part' >
      {isEditing ? (
        <>
          <input
            type="text"
            value={editedIssueName}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onKeyDown={handleInputKeyDown}
            autoFocus
          />
          <div className="close">X</div>
        </>
      ) : (
        <div className="issueType">
          {getIssueIcon(issue.IssueType || 'Story')}
          <div className={issue.status === 'Done' ? 'issue-done' : 'value'}>
            {issue.IssueName}
            {!issue.IsCompulsory && (
                <FaPencilAlt 
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleEditClick(); }} 
                  className="edit-icon" 
                />
              )}
          </div>
        </div>
      )}
      <div className="addEpic">
        {selectedEpic ? (
          <span className="selected-epic">{selectedEpic}</span>
        ) : (
          <>


          </>
        )}
        
      </div>
      </div>
      <div className="right-most"  onClick={(e) => e.stopPropagation()}>
        <div className="right">
          <IssueStatus issueName={issue} pid={projectid} onissueTypeChange={onissueTypeChange} />
        </div>
        <div className="storypoints">
          <IssueStorypoints issueName={issue} pid={projectid} onissueTypeChange={onissueTypeChange} />
        </div>
        
          <div className="assignee-container">
          <AssigneeSelector issue={issue} projectid={projectid} onAssigneeChange={(newAssignee) => handleAssigneeChange(newAssignee)} />
           </div>
       
           {!issue.IsCompulsory && (
          <div id="deleteIssue" className="Dropdown" onClick={handleDeleteIssue}>
            <FaRegTrashAlt size={16} />
          </div>
        )}
      </div>
      {showPopup && (
              <div className="popup-overlay" onClick={togglePopup}>
                <div className="popup-content" onClick={(e) => e.stopPropagation()}>
                  <DisplayIssueFilters data={issue} user={user}/>
                </div>
              </div>
            )}
    </div>
</div>
  );
};


export default connect(null, { addIssue })(Backlog);

