import React, { useState, useEffect } from 'react';
import './css/colsprint.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import axios from 'axios';

const Colsprint = ({ projectId }) => {
  const [sprints, setSprints] = useState([]);

  useEffect(() => {
    // Fetch sprints for the specific project ID
    axios.get(`http://localhost:8000/djapp/sprints/?projectid=${projectId}`)
      .then(response => {
        setSprints(response.data.sprints);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        let errorMessage = "Failed to load sprints. Please try again later.";

            if (error.response) {
                errorMessage = error.response.data.error || "Something went wrong.";
            } else if (error.request) {
                errorMessage = "No response from server. Check your internet connection.";
            }

            alert(errorMessage);
      });
  }, [projectId]);

  return (
    <div className="colsprint-container">
      <p className="monthlabel"></p>
      <p className='sprintlabel'>Sprints</p>
      {sprints.map(sprint => (
        <div className="sprint" key={sprint.sprint}>
          <i id='righticon' className="fas fa-chevron-right dropdown-icon"></i>
          <p>{sprint.sprint}</p>
        </div>
      ))}
    </div>
  );
};

export default Colsprint;
