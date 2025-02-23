import React from 'react';
import axios from 'axios';

const CreateRepoButton = () => {
    const createRepo = () => {
        const repoName = prompt('Enter repository name:');

        if (!repoName) {
            alert('Repository name is required!');
            return;
        }

        axios.post('/gitmanager/create-repo/', { repo_name: repoName })
            .then(response => {
                if (response.data.error) {
                    alert('Error: ' + response.data.error);
                } else {
                    alert('Repository created successfully!');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred while creating the repository.');
            });
    };

    return (
        <button onClick={createRepo}>Create Repository</button>
    );
};

export default CreateRepoButton;

