import React, { useState } from 'react';
import axios from 'axios';

const FileUpload = () => {
  const [files, setFiles] = useState([]);

  const handleFileChange = (e) => {
    setFiles([...e.target.files]);
  };

  const handleUpload = async () => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    try {
      const response = await axios.post('http://localhost:8000/djapp/upload/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log('Upload successful', response);
    } catch (error) {
      console.error('Error uploading files', error);
    }
  };

  return (
    <div style={{marginTop:'10rem'}}>
        <p>hello why are you not working at alll?</p>
        <h1>File Upload</h1>
      <input type="file" multiple onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
};

export default FileUpload;
