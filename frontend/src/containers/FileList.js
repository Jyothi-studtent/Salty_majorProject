import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '.css/FileList.css';

const FileList = () => {
    const [files, setFiles] = useState([]);

    useEffect(() => {
        const fetchFiles = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:8000/djapp/files/');
                setFiles(response.data);
            } catch (error) {
                console.error("Error fetching files:", error);
            }
        };

        fetchFiles();
    }, []);

    return (
        <div className="file-list-container">
            <h2>Uploaded Files</h2>
            {files.length === 0 ? <p>No files uploaded yet.</p> : (
                <ul>
                    {files.map(file => (
                        <li key={file.id}>
                            <a href={`http://127.0.0.1:8000${file.file_url}`} target="_blank" rel="noopener noreferrer">
                                {file.file_name}
                            </a> 
                            (Uploaded on: {new Date(file.uploaded_at).toLocaleString()})
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default FileList;
