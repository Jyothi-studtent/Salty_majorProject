import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import './CommentsStyle.css';
import { FaRegEdit } from "react-icons/fa";
import Scroll from '../components/Scroll';

function Comment({ user, data }) {
  const [commentBody, setCommentBody] = useState('');
  const [comments, setComments] = useState([]);
  const [editCommentBody, setEditCommentBody] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);

  useEffect(() => {
    fetchComments();
  }, [data.issue_id]);

  const createComment = async () => {
    try {
      const response = await axios.post('http://localhost:8000/djapp/create_comment/', {
        issue_id: data.issue_id,
        project_id: data.project_id,
        written_by: user.email,
        comment_body: commentBody
      });
      console.log('Comment created:', response.data);
      setCommentBody(''); // Clear comment body after successful submission
      fetchComments(); // Fetch comments again after submitting a new comment
    } catch (error) {
      console.error('Error creating comment', error);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/djapp/fetch_comments/${data.id}/`);
      setComments(response.data);
    } catch (error) {
      console.error('Error fetching comments', error);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    createComment();
  };

  const editComment = async () => {
    try {
      const response = await axios.post('http://localhost:8000/djapp/edit_comment/', {
        comment_id: editingCommentId,
        comment_body: editCommentBody,
        user_email: user.email
      });
      console.log('Comment edited:', response.data);
      setEditCommentBody(''); // Clear edit comment body after successful submission
      setEditingCommentId(null); // Clear editing comment ID after successful submission
      fetchComments(); // Fetch comments again after editing a comment
    } catch (error) {
      console.error('Error editing comment', error);
    }
  };

  const handleEditSubmit = (event) => {
    event.preventDefault();
    editComment();
  };

  const startEditing = (comment) => {
    setEditingCommentId(comment.comment_id);
    setEditCommentBody(comment.comment_body);
  };

  return (
    <div className="comments-section">
      <h1 className="comments-title" style={{marginTop:'2rem',  marginBottom:'2rem'}}>Comments:</h1>
      <form onSubmit={handleSubmit} className="comment-form">
        <div className="comment-input-container">
          <textarea
            className="comment-textarea"
            value={commentBody}
            onChange={(e) => setCommentBody(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                createComment();
              }
            }}
            placeholder="Enter your comment"
            rows="4"
            cols="50"
          />
        </div>
        <div className="comment-submit-button-container">
          <button type="submit" className="comment-submit-button">Post Comment</button>
        </div>
      </form>
     
        <div className="comments-list">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment.comment_id} className="comment-item">
                <div className="comment-body">{comment.comment_body}</div>
                <div className="comment-meta">
                  <div className="comment-author-date">
                    <p>{comment.written_by}</p>
                    <p><small>{comment.created_at}</small></p>
                  </div>
                  {comment.written_by === user.email && (
                    <FaRegEdit onClick={() => startEditing(comment)} className="comment-edit-pen"></FaRegEdit>
                  )}
                </div>
                {editingCommentId === comment.comment_id && (
                  <form onSubmit={handleEditSubmit} className="edit-comment-form">
                    <div className="edit-comment-input-container">
                      <textarea
                        className="edit-comment-textarea"
                        value={editCommentBody}
                        onChange={(e) => setEditCommentBody(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            editComment();
                          }
                        }}
                        placeholder="Edit your comment"
                        rows="4"
                        cols="50"
                      />
                    </div>
                    <div className="edit-comment-submit-button-container">
                      <button type="submit" className="edit-comment-submit-button">Save Changes</button>
                    </div>
                  </form>
                )}
              </div>
            ))
          ) : (
            <p className="no-comments">No comments yet.</p>
          )}
        </div>
      
    </div>
  );
}

const mapStateToProps = (state) => ({
  user: state.auth.user, // Assuming the user information is stored in the 'auth' slice of the Redux state
});

export default connect(mapStateToProps)(Comment);

