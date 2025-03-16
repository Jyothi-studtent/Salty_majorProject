import React, { useState, useEffect } from "react";
import axios from "axios";
import "./css/FileComp.css"; // Import the CSS file
import Cookies from "js-cookie";

const FileComp = ({ issueId, isEditing, issue_id }) => {
    const [files, setFiles] = useState([]);
    const [newFiles, setNewFiles] = useState([]);
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (issueId) {
            fetchFiles();
        }
    }, [issueId]);

    const fetchFiles = async () => {
        try {
            const response = await axios.get(`http://127.0.0.1:8000/djapp/files/?issue_id=${issueId}`);
            setFiles(response.data);
        } catch (error) {
            console.error("Error fetching files:", error);
        }
    };

    const handleDelete = async (fileId) => {
        try {
            const csrfToken = Cookies.get("csrftoken");  // ✅ Get CSRF token from cookies
            
            const response = await axios.delete(`http://127.0.0.1:8000/djapp/delete_file/${fileId}/`, {
                headers: {
                    "X-CSRFToken": csrfToken,
                    "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
                    "Content-Type": "application/json"
                },
                withCredentials: true,
            });
    
            console.log("File deleted successfully:", response.data);
        } catch (error) {
            console.error("Delete error:", error);
        }
    };
    const handleFileChange = (event) => {
        const selectedFiles = Array.from(event.target.files);
        setNewFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
    };
    
    useEffect(() => {
        axios.get("http://127.0.0.1:8000/djapp/get_csrf_token/", { withCredentials: true })
            .then(response => {
                console.log("CSRF Token fetched:", response.data.csrfToken);
                Cookies.set("csrftoken", response.data.csrfToken);  // Ensure it's stored
            })
            .catch(error => console.error("CSRF Fetch error:", error));
    }, []);
    

    const handleUpload = async () => {
        if (newFiles.length === 0) {
            setMessage("Please select at least one file.");
            return;
        }

        const formData = new FormData();
        newFiles.forEach((file) => formData.append("files", file)); // Ensure backend expects 'files' key
        formData.append("issue_id", issue_id);

        try {
            await axios.post("http://localhost:8000/djapp/upload_file/", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            setMessage("Files uploaded successfully!");
            setNewFiles([]); // Clear selected files after upload
            fetchFiles(); // Refresh file list
        } catch (error) {
            setMessage("Error uploading files");
            console.error("Upload error:", error);
        }
    };

    return (
        <div className="file-comp-container">
            <h4>Uploaded Files</h4>

            {files.length > 0 ? (
                <ul className="file-list">
                    {files.map((file) => (
                        <li key={file.id}>
                            <a href={`http://localhost:8000${file.file_url}`} target="_blank" rel="noopener noreferrer">
                                {file.file_name}
                            </a>{" "}
                            <span className="uploaded-time">
                                (Uploaded: {new Date(file.uploaded_at).toLocaleString()})
                            </span>
                            {isEditing && (
                                <button onClick={() => handleDelete(file.id)} className="delete-button">
                                    Delete
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="no-files">No files uploaded for this issue.</p>
            )}

            {isEditing && (
                <div className="file-upload-container">
                    <input type="file" multiple onChange={handleFileChange} />
                    <button onClick={handleUpload}>Upload</button>
                    <p className="message">{message}</p>
                </div>
            )}
        </div>
    );
};

export default FileComp;
