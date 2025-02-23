import React from 'react';
import './css/IssueCardH.css';

const IssueCardHorizontal = ({ issue, onClick }) => {
    return (
        <div>
            <div className="issue-card-horizontal-h" onClick={onClick}>
                <div className="details-h">
                    <span className="issue-type-h">{issue.IssueType || 'Epic'}</span>
                    <span className="issue-name-h">{issue.IssueName|| issue.EpicName}</span>
                    <span className="description-h">{issue.description|| '----'}</span>
                    <span className="assigned-by-h">{issue.assigned_by|| '----'}</span>
                    <span className="status-h">{issue.status|| '----'}</span>
                    <span className="assignee-h">{issue.assignee|| '----'}</span>
                    <span className='prority-h'>{issue.Priority|| '----'}</span>
                </div>
            </div>
        </div>
    );
};

export default IssueCardHorizontal;

