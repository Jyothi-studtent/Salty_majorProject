import React, { useState, useEffect } from "react";
import axios from "axios";

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

    const handleFileChange = (event) => {
        const selectedFiles = Array.from(event.target.files);
        console.log("Selected files:", selectedFiles);
        setNewFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
    };

    const handleUpload = async () => {
        if (newFiles.length === 0) {
            setMessage("Please select at least one file.");
            return;
        }

        const formData = new FormData();
        newFiles.forEach(file => formData.append("files", file)); // Ensure backend expects 'files' key
        console.log(issue_id, '###########################')
        formData.append("issue_id", issue_id);

        // Debug: Log FormData contents
        for (let pair of formData.entries()) {
            console.log("FormData:", pair[0], pair[1]);
        }

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
        <div>
            {files.length > 0 ? (
                <ul>
                    {files.map((file) => (
                        <li key={file.id}>
                            <a href={`http://localhost:8000${file.file_url}`} target="_blank" rel="noopener noreferrer">
                                {file.file_name}
                            </a>{" "}
                            (Uploaded: {new Date(file.uploaded_at).toLocaleString()})
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No files uploaded for this issue.</p>
            )}

            {isEditing && (
                <>
                    <input type="file" multiple onChange={handleFileChange} />
                    <button onClick={handleUpload}>Upload</button>
                    <p>{message}</p>
                </>
            )}
        </div>
    );
};

export default FileComp;
