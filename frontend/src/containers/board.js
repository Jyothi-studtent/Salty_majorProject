import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useParams, useLocation } from 'react-router-dom';
import { connect } from 'react-redux';
import { SiStorybook } from "react-icons/si";
import { FaBug } from 'react-icons/fa';
import { FaTasks } from "react-icons/fa";
import Sidebar from "../components/Sidebar";
import AssigneeSelector from './AssigneeSelector';
import ProjectPage from "./ProjectPage";
import './css/board.css'; // Importing the CSS file
import BoardsIssueDisplay from './BoardsIssueDisplay';
import { useSelector } from "react-redux";
const ItemType = 'ITEM';

const issueTypeToIcon = {
  Story: <SiStorybook />,
  Task: <FaTasks />,
  Bug: <FaBug />,
};

const DraggableItem = ({ id, IssueName, status, projectid, IssueType, assignee, onDrop, item, user }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemType,
    item: { id, IssueName, status, IssueType },
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult();
      if (dropResult) {
        onDrop(item, dropResult);
      }
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }), [id, IssueName, status, IssueType]);

  // const [assignee_fullname, setFullname] = useState("");

  // const fetchAssigneeName = async () => {
  //   try {
  //     const response = await axios.post("http://localhost:8000/djapp/fetchassigneeName/", {
  //       email: assignee
  //     });
  //     setFullname(response.data.assigneeName);
  //   } catch (error) {
  //     console.error("Error fetching assignee name:", error);
  //   }
  // };

  // useEffect(() => {
  //   if (assignee) {
  //     fetchAssigneeName();
  //   }
  // }, [assignee]);

  const icon = issueTypeToIcon[IssueType];
  const [showPopup, setShowPopup] = useState(false);
  const togglePopup = () => {
    setShowPopup(!showPopup);
  };

  const handleAssigneeChange = (newAssignee) => {
    console.log(`Assignee changed to: ${newAssignee}`);
    // Add your logic here to handle the assignee change, if needed
  };

  return (
    <>
      <div
        ref={drag}
        className="boardDraggableItem"
        style={{ opacity: isDragging ? 0.5 : 1 }}
        onClick={togglePopup}
      >
        <div className="boardDraggableItemDetails">
          <div className='icon'>
          {icon}
          </div>
          <div className={status === 'Done' ? 'done' : ''} id="issuename">  {IssueName}</div>
        </div>
        <div className="Assinee" onClick={(event) => event.stopPropagation()}>
          <AssigneeSelector issue={item} projectid={projectid} onAssigneeChange={(newAssignee) => handleAssigneeChange(newAssignee)} />
        </div>
      </div>
      {showPopup && (
        <div className="popup-overlay" onClick={togglePopup}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <BoardsIssueDisplay data={item} />
          </div>
        </div>
      )}
    </>
  );
};

const DropZone = ({ id, items, setItems, onDrop, projectid, user, selectedSprint, setReload }) => {
  const [, drop] = useDrop({
    accept: 'ITEM',
    drop: () => ({ id }),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  const [showCreateIssue, setShowCreateIssue] = useState(false);
  const [newIssueName, setNewIssueName] = useState('');
  const scrollRef = useRef(null);

  const inputRef = useRef(null);
  useEffect(() => {
    const scrollFunction = () => {
      if (showCreateIssue && scrollRef.current) {
        const scrollElement = scrollRef.current;
        const offset = 100; // Adjust as needed
        window.scrollTo({
          top: scrollElement.getBoundingClientRect().top + window.scrollY - offset,
          behavior: 'smooth',
        });
      }
    };
  
    // Scroll on next tick to ensure DOM is updated
    if (showCreateIssue) {
      setTimeout(scrollFunction, 0); // Delayed scroll
    }
  
    return () => {
      clearTimeout(scrollFunction);
    };
  }, [showCreateIssue]);
  

  useEffect(() => {
    if (showCreateIssue) {
      inputRef.current.focus();
    }
  }, [showCreateIssue]);

  const handleCreateIssue = async () => {
    const newIssue = {
      IssueName: newIssueName,
      IssueType: "Story",
      projectId: projectid,
      sprint: selectedSprint,
      assigned_epic: null,
    };
    console.log(newIssue)
    try {
      
      await axios.post('http://localhost:8000/djapp/add/', newIssue);
      setReload(prev => !prev); // Trigger reload
    } catch (error) {
      console.log("Error creating issue:", error);
      let errorMessage = "Failed to load team members. Please try again later.";

            if (error.response) {
                errorMessage = error.response.data.error || "Something went wrong.";
            } else if (error.request) {
                errorMessage = "No response from server. Check your connection.";
            }

            alert(errorMessage); 
    }

    setNewIssueName('');
    setShowCreateIssue(false);
  };

  const handleCloseForm = () => {
    setShowCreateIssue(false);
    setNewIssueName('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleCloseForm();
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleClickOutside = (e) => {
    if (inputRef.current && !inputRef.current.contains(e.target)) {
      handleCloseForm();
    }
  };

  useEffect(() => {
    if (showCreateIssue) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCreateIssue]);

  return (
    <div ref={drop} className={`boardDropZone boardDropZone${id}`}>
      <div className="boardDropZoneTitle">
        {id === 1 ? 'To Do' : id === 2 ? 'In Progress' : 'Done'}
      </div>
      {selectedSprint ? (
        items.map((item) => (
          <DraggableItem
            key={item.id}
            id={item.id}
            IssueType={item.IssueType}
            IssueName={item.IssueName}
            item={item}
            status={item.status}
            assignee={item.assignee || null}
            onDrop={onDrop}
            user={user}
            projectid={projectid}
          />
        ))
      ) : (
        id === 1 && <div className="start-sprint-message">Start sprint to get started</div>
      )}

      {showCreateIssue && (
        <div className="create-issue-form"  ref={scrollRef} >
          <input
            type="text"
            value={newIssueName}
            ref={inputRef}
            onChange={(e) => setNewIssueName(e.target.value)}
            placeholder="Enter issue name"
          />
          <button onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); handleCreateIssue();  }}>Create Issue</button>
          <button onClick={handleCloseForm}>Cancel</button>
        </div>
      )}

      { selectedSprint && id === 1 && !showCreateIssue && (
        <div className="create-issue-button" onClick={() => setShowCreateIssue(true)}>
          + Create Issue
        </div>
      )}
    </div>
  );
};


const Board = ({ user }) => {
  const [selectedSprint, setSelectedSprint] = useState('');
  const [items1, setItems1] = useState([]);
  const [items2, setItems2] = useState([]);
  const [items3, setItems3] = useState([]);
  const [issues, setIssues] = useState([]);
  const [sprintOptions, setSprintOptions] = useState([]);
  const { projectid } = useParams();
  const location = useLocation();
  const token = useSelector((state) => state.auth.access);
  const searchParams = new URLSearchParams(location.search);
  const sprintName = searchParams.get('sprintName');
  const [reload, setReload] = useState(false); // State to trigger re-render

  const fetchIssues = async () => {
    if (selectedSprint) {
      try {
        const response = await axios.get("http://localhost:8000/djapp/issuesOfSprint/", {
          params: { projectId: projectid, sprintName: selectedSprint },headers: {
            Authorization: `JWT ${token}`, // 🔹 Pass token from Redux state
          }
        });
        const issues = response.data;
        setIssues(issues);

        setItems1(issues.filter(item => item.status === 'To-Do'));
        setItems2(issues.filter(item => item.status === 'In-Progress'));
        setItems3(issues.filter(item => item.status === 'Done'));
      } catch (error) {
        console.error("Error fetching issues:", error);
        let errorMessage = "Failed to load team members. Please try again later.";

            if (error.response) {
                errorMessage = error.response.data.error || "Something went wrong.";
            } else if (error.request) {
                errorMessage = "No response from server. Check your connection.";
            }

            alert(errorMessage); 
      }
    }
  };

  const fetchSprints = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/djapp/get_activesprints/?projectid=${projectid}`);
      setSprintOptions(response.data.sprint_in_project);
      if (!sprintName) {
        setSelectedSprint(response.data.sprint_in_project[0]?.sprint || '');
      } else {
        setSelectedSprint(sprintName);
      }
    } catch (error) {
      console.error('Error fetching sprints:', error);
      let errorMessage = "Error fetching sprints:. Please try again later.";

            if (error.response) {
                errorMessage = error.response.data.error || "Something went wrong.";
            } else if (error.request) {
                errorMessage = "No response from server. Check your connection.";
            }

            alert(errorMessage); 
    }
  };

  useEffect(() => {
    fetchSprints();
  }, [projectid, sprintName]);

  useEffect(() => {
    if (projectid && selectedSprint) {
      fetchIssues();
    }
  }, [selectedSprint, projectid, reload]);

  const handleDrop = async (item, dropResult) => {
    const { id: itemId, IssueName, status } = item;
    const { id: dropZoneId } = dropResult;
    let newStatus;

    if (dropZoneId === 1) {
      newStatus = 'To-Do';
    } else if (dropZoneId === 2) {
      newStatus = 'In-Progress';
    } else if (dropZoneId === 3) {
      newStatus = 'Done';
    }

    if (newStatus === status) {
      return;
    }

    try {
      await axios.post('http://localhost:8000/djapp/update_issueStatus/', { issue: IssueName, status: newStatus, projectId: projectid });

      setReload(prev => !prev); // Toggle the reload state to trigger re-render
    } catch (error) {
      console.error("Error updating item status:", error);
      let errorMessage = "Error updating item status:. Please try again later.";

            if (error.response) {
                errorMessage = error.response.data.error || "Something went wrong.";
            } else if (error.request) {
                errorMessage = "No response from server. Check your connection.";
            }

            alert(errorMessage); 
      
    }
  };

  const handleSprintComplete = async () => {
    const allIssuesDone = issues.every(issue => issue.status === 'Done');
    if (allIssuesDone) {
      const confirmComplete = window.confirm("This sprint is completed. Well done! Do you want to complete it?");
      console.log("confirmmmmm",confirmComplete)
      if (confirmComplete) {
        await axios.get("http://localhost:8000/djapp/updateSprintStatus/", {
          params: { projectId: projectid, sprintName: selectedSprint,status:"completed" }
        });
        fetchSprints();
        setSelectedSprint(sprintOptions[0]?.sprint || '');
        setItems1([]);
        setItems2([]);
        setItems3([]);
        setReload(prev => !prev);
      }
    } else {
      alert("Please complete all issues before completing the sprint.");
    }
  };

  return (
    <>
      <Sidebar />
      <div className="boards-main">
        <DndProvider backend={HTML5Backend}>
          <div className='boards'>
            <div className="boardContainer">
              <div className='selectsprint'>

                <div className="head">
                  <h3 className="heading">Select Sprint</h3>
                </div>
                <div className="boardDropdown">
                  <select className="Selectboardsprint" value={selectedSprint} onChange={(e) => setSelectedSprint(e.target.value)}>
                    <option value="">Select...</option>
                    {sprintOptions.map((sprint) => (
                      <option key={sprint.sprint} value={sprint.sprint}>
                        {sprint.sprint}
                      </option>
                    ))}
                  </select>
                </div>
                </div>
                <div className='team-time'><ProjectPage/></div>
                <button className="completebtn" onClick={handleSprintComplete}>Complete Sprint</button>
             
              <div className="boardFlexContainer">
                <DropZone id={1} items={items1} setItems={setItems1} onDrop={handleDrop} user={user} selectedSprint={selectedSprint} projectid={projectid} setReload={setReload} />
                <DropZone id={2} items={items2} setItems={setItems2} onDrop={handleDrop} user={user} selectedSprint={selectedSprint} projectid={projectid} setReload={setReload} />
                <DropZone id={3} items={items3} setItems={setItems3} onDrop={handleDrop} user={user} selectedSprint={selectedSprint} projectid={projectid} setReload={setReload} />
              </div>
            </div>
          </div>
        </DndProvider>
      </div>
    </>
  );
};

const mapStateToProps = state => ({
  user: state.auth.user // Assuming the user information is stored in the 'auth' slice of the Redux state
});

export default connect(mapStateToProps)(Board);
