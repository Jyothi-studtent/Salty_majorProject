import React, { useState } from 'react';
import axios from 'axios';

export default function IssueStorypoints({ issueName ,pid,onissueTypeChange}) {
  const [selectedStorypoints, setSelectedStorypoints] = useState(issueName.StoryPoint);


  const handleStatusChange = async (event) => {
    console.log("isuue",issueName)
    console.log("storryyyy before",selectedStorypoints)
    const newStatus = event.target.value;
   
    setSelectedStorypoints(newStatus);
    console.log("storryyyy after",selectedStorypoints,newStatus)
    onissueTypeChange(true)
   
    try {
      await axios.post('http://localhost:8000/djapp/update_storypoints/', { issue:issueName.IssueName ,status:newStatus,projectId:pid});    } catch (error) {
      console.error('Error updating issue storypoints:', error);
      let errorMessage = "Error updating issue storypoints:";

      if (error.response) {
          errorMessage = error.response.data.error || "Something went wrong.";
      } else if (error.request) {
          errorMessage = "No response from server. Check your internet connection.";
      }

      alert(errorMessage);
    }
  };

  return (
    <div>
      <select id="status" value={selectedStorypoints} onChange={handleStatusChange} style={{
          width: '50px',
                
          padding: '5px',        
          marginRight: '10px'    
        }}>
      
      
          <option value="" disabled>
            Story Points
          </option>
       
       
        <option value="1"> 1</option>
        <option value="2"> 2 </option>
        <option value="3"> 3 </option>
        <option value="5"> 5 </option>
        <option value="8"> 8 </option>
        <option value="13"> 13 </option>
       
      </select>
    </div>
  );
}


