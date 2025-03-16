import React, { useState, useEffect } from 'react';
import './css/col_max.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import axios from 'axios';

const Cols = ({ projectId }) => {
  const [sprints, setSprints] = useState([]);

  useEffect(() => {
    console.log("colinnnee",projectId)
    axios.get('http://localhost:8000/djapp/sprints/', {
      params: { projectid: projectId }
    })
    .then(response => {
      setSprints(response.data.sprints);
    })
    .catch(error => {
      console.error('Error fetching data:', error);
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

export default Cols;
