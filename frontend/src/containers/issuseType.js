import React, { useState, useEffect, useRef } from 'react';
import './css/IssueType.css';
import { SiStorybook } from "react-icons/si";
import { FaBug } from 'react-icons/fa';
import { FaTasks } from "react-icons/fa";

const IssueType = ({ onSelect }) => {
  const [isOptionsVisible, setIsOptionsVisible] = useState(false);
  const [selectedOption, setSelectedOption] = useState('Story');
  const containerRef = useRef(null);
  const optionsRef = useRef(null);
  

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOptionsVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isOptionsVisible) {
      const optionsRect = optionsRef.current.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();
      const isNotFullyVisible = optionsRect.bottom > window.innerHeight || optionsRect.top < 0;

      if (isNotFullyVisible) {
        optionsRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    }
  }, [isOptionsVisible]);

  const toggleOptions = () => {
    setIsOptionsVisible(!isOptionsVisible);
  };

  const handleOptionClick = (event, option) => {
    event.stopPropagation(); // Stop event propagation
    setSelectedOption(option);
    setIsOptionsVisible(false);
    onSelect(option);
  };

  return (
    <div className="Container" ref={containerRef}>
      <div className="toggle-div" onClick={toggleOptions}>
        {selectedOption === 'Story' && <SiStorybook />}
        {selectedOption === 'Bug' && <FaBug />}
        {selectedOption === 'Task' && <FaTasks />}
        <span className="arrow">{isOptionsVisible ? '▲' : '▼'}</span>
      </div>
      {isOptionsVisible && (
        <div className="options-div" ref={optionsRef}>
          <div className="option" onClick={(e) => handleOptionClick(e, 'Story')}>
            <SiStorybook />
            <span>Story</span>
          </div>
          <div className="option" onClick={(e) => handleOptionClick(e, 'Bug')}>
            <FaBug />
            <span>Bug</span>
          </div>
          <div className="option" onClick={(e) => handleOptionClick(e, 'Task')}>
            <FaTasks />
            <span>Task</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default IssueType;
