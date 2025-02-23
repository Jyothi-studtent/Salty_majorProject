import React, { useState } from 'react';

const CustomDropdown = ({ options, value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleSelect = (email) => {
        onChange({ target: { name: 'assignee', value: email } });
        setIsOpen(false);
    };

    return (
        <div className="dropdown-team">
            <div className="selected-value-fc" onClick={() => setIsOpen(!isOpen)}>
                {options.find(user => user.email === value)?.email || 'Select...'}
            </div>
            {isOpen && (
                <div className="dropdown-content">
                    {options.map(user => (
                        <div key={user.email} className="member-option" onClick={() => handleSelect(user.email)}>
                            {user.first_letter && user.color ? (
                                <div className="circle-drop" style={{ backgroundColor: user.color }}>
                                    {user.first_letter}
                                </div>
                            ) : (
                                <div className="circle-drop" style={{ backgroundColor: '#ccc' }}>
                                    ?
                                </div>
                            )}
                            <span>{user.email}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CustomDropdown;

