import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus } from '@fortawesome/free-solid-svg-icons';
import Add_project_members from './Add_project_members'; // Import the component

const ProjectDashboard = ({ group }) => {
    const [showForm, setShowForm] = useState(false);

    return (
        <div>
            {/* Add Team Members Icon */}
            <FontAwesomeIcon
                icon={faUserPlus}
                className="add-team-icon"
                onClick={() => setShowForm(true)} // Show modal on click
            />

            {/* Render Add_project_members if showForm is true */}
            {showForm && (
                <Add_project_members 
                    group={group} 
                    onClose={() => setShowForm(false)} // Close modal function
                />
            )}
        </div>
    );
};

export default ProjectDashboard;
