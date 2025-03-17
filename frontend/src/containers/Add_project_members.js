import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './css/add_project_members.css';

const AddProjectMembers = ({ group, onClose }) => {
    const { projectid } = useParams(); // Extract project ID from URL
    const [newEmail, setNewEmail] = useState('');
    const [emailList, setEmailList] = useState([]);
    const [existingMembers, setExistingMembers] = useState([]); // ✅ Store existing members
    const [loading, setLoading] = useState(false); // ✅ Track loading state

    // ✅ Fetch existing project members when component loads
    useEffect(() => {
        const fetchProjectMembers = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/djapp/project_members/${projectid}/`);
                setExistingMembers(response.data.members); // ✅ Store existing members
            } catch (error) {
                console.error('Error fetching project members:', error);
            }
        };

        fetchProjectMembers();
    }, [projectid]);

    const handleAddEmail = () => {
        const trimmedEmail = newEmail.trim();
        
        if (trimmedEmail === '') {
            alert('Please enter an email address.');
            return;
        }
    
        // ✅ Check if email contains "@" symbol
        if (!trimmedEmail.includes('@')) {
            alert('Please enter a valid email address with "@" symbol.');
            setNewEmail(''); // Clear input
            return;
        }
    
        // ✅ Check if email is already in the project
        if (existingMembers.includes(trimmedEmail)) {
            alert(`The email ${trimmedEmail} is already in the project.`);
            setNewEmail('');
            return;
        }
    
        // ✅ Check if email is already added in the list
        if (!emailList.includes(trimmedEmail)) {
            setEmailList([...emailList, trimmedEmail]);
        } else {
            alert('Email already added to the invitation list.');
        }
    
        setNewEmail('');
    };
    

    const handleRemoveEmail = (emailToRemove) => {
        setEmailList(emailList.filter(email => email !== emailToRemove));
    };

    const handleInviteMembers = async () => {
        if (!projectid || emailList.length === 0) return;

        setLoading(true); // ✅ Show spinner
        try {
            await axios.post('http://localhost:8000/djapp/invite_project_members/', {
                project_id: projectid,
                emails: emailList
            });

            alert('Invitations sent successfully!');
            onClose();
        } catch (error) {
            console.error('Error sending invitations:', error);
            alert('Failed to send invitations.');
        } finally {
            setLoading(false); // ✅ Hide spinner
        }
    };

    return (
        <div className="add-project-modal">
            <div className="add-project-modal-content">
                <span className="add-project-close" onClick={onClose}>&times;</span>
                <h3 className="add-project-title">Add Members to Project {projectid}</h3>

                {/* Box displaying added emails */}
                <div className="add-project-email-list-box">
                    {emailList.length > 0 ? (
                        emailList.map((email, index) => (
                            <div key={index} className="add-project-email-tag">
                                {email}
                                <button className="add-project-remove-email-btn" onClick={() => handleRemoveEmail(email)}>❌</button>
                            </div>
                        ))
                    ) : (
                        <p>No members added yet</p>
                    )}
                </div>

                {/* Input to add new emails */}
                <input
                    type="text"
                    placeholder="Enter email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    disabled={loading} // ✅ Disable input while loading
                    className="add-project-email-input"
                />
                <button className="add-project-add-email-btn" onClick={handleAddEmail} disabled={loading}>
                    Add Email
                </button>

                {/* Submit button to send invitations with spinner */}
                <button className="add-project-submit-btn" onClick={handleInviteMembers} disabled={loading}>
                    {loading ? <span className="add-project-spinner"></span> : "Send Invitations"}
                </button>
            </div>
        </div>
    );
};

export default AddProjectMembers;
