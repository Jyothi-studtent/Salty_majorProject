import React from 'react';
import { FaBug, FaTasks } from 'react-icons/fa';
import { SiStorybook } from 'react-icons/si';

const IssueCard = ({ issue, onClick }) => {
  const renderIcon = (issueType) => {
    switch (issueType) {
      case 'Bug':
        return <FaBug />;
      case 'Task':
        return <FaTasks />;
      default:
        return <SiStorybook />;
    }
  };

  return (
    <div className="issue-card" onClick={() => onClick(issue)}>
      <div className="issue-header">
        {renderIcon(issue.IssueType)}
        <h3>{issue.IssueName || issue.EpicName}</h3>
      </div>
    </div>
  );
};

export default IssueCard;
