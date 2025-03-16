import React, { useState } from 'react';
import axios from 'axios';
import './css/add_group_members.css';

const Add_project_members = ({ group, onClose }) => {
    const [newEmail, setNewEmail] = useState('');
    const [emailList, setEmailList] = useState([]);

    const handleAddEmail = () => {
        if (newEmail.trim() !== '' && !emailList.includes(newEmail.trim())) {
            setEmailList([...emailList, newEmail.trim()]);
            setNewEmail('');
        }
    };

    const handleRemoveEmail = (emailToRemove) => {
        setEmailList(emailList.filter(email => email !== emailToRemove));
    };

    const handleInviteMembers = async () => {
        if (!group || emailList.length === 0) return;
    
        try {
            await axios.post('http://localhost:8000/djapp/invite_project_members/', {
                project_id: group.projectid, // Ensure project ID is sent
                emails: emailList
            });
    
            alert('Invitations sent successfully!');
            onClose();
        } catch (error) {
            console.error('Error sending invitations:', error);
            alert('Failed to send invitations.');
        }
    };
    
    return (
        <div className="modal">
            <div className="modal-content">
                <span className="close" onClick={onClose}>&times;</span>
                

                {/* Box displaying added emails */}
                <div className="email-list-box">
                    {emailList.length > 0 ? (
                        emailList.map((email, index) => (
                            <div key={index} className="email-tag">
                                {email}
                                <button className="remove-email-btn" onClick={() => handleRemoveEmail(email)}>❌</button>
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
                />
                <button className="add-email-btn" onClick={handleAddEmail}>Add Email</button>

                {/* Submit button to send invitations */}
                <button className="submit-btn" onClick={handleInviteMembers}>
                    Send Invitations
                </button>
            </div>
        </div>
    );
};

export default Add_project_members;
