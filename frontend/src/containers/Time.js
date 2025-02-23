import React, { useState, useEffect } from 'react';
import Timeline from './Timeline';
import { useNavigate, useLocation,useParams } from 'react-router-dom';
const Time = () => {
  
  
  const {projectid }= useParams();
  console.log(projectid)
  return (
    <div>
     
      <Timeline projectId={projectid}  />
   
    </div>
  );
};

export default Time;

