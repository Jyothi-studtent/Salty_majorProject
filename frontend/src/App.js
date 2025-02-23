import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './containers/Home';
import Login from './containers/Login';
import Backlog from './containers/Sprint';
import Project from './containers/Project';
import ProjectPage from './containers/ProjectPage';
import DisplayBacklog from './containers/DisplayBacklog';
import Filters from './containers/Filters';
import Signup from './containers/Signup';
import Board from './containers/board';
import Activate from './containers/Activate';
import Resetpassword from './containers/Resetpassword';
import Resetpasswordconfirm from './containers/Resetpasswordconfirm';
import Accept_invitation from './containers/Accept_invitation';
import Layout from './hocs/Layout';
import { Provider } from 'react-redux';
import store from './store';
import Sprint from './containers/Sprint';
import Contributions from './containers/Contributions';
import MyIssues from './containers/MyIssues';
import Profile from './containers/Profile';
import Time from './containers/Time';


import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Timemaxi from './containers/Timemaxi';
import FileUpload from './containers/FileUpload';


const App = () => {
  return (
    <div>
        <DndProvider backend={HTML5Backend}>
      <Provider store={store}>
        <Router>
            <Layout>
            <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login/>} />
            <Route path="/signup" element={<Signup/>} />
            <Route path="/activate/:uid/:token" element={<Activate/>} />
            <Route path="/reset_password" element={<Resetpassword/>} />
            <Route path="/password/reset/confirm/:uid/:token" element={<Resetpasswordconfirm/>} />
            <Route path="/project" element={<Project />} />
            <Route path="/project/:projectid" element={<ProjectPage />} />
            <Route path="/project/:projectid/boards" element={<Board />} />
            <Route path="/accept-invitation" element={<Accept_invitation />} />
            <Route path="/project/:projectid/backlog" element={<DisplayBacklog/>} />
            <Route path="/project/:projectid/filters" element={<Filters/>} />
            <Route path="/project/:projectid/myissues" element={<MyIssues />} />
            <Route path="/project/:projectid/profile" element={<Profile />} />
            <Route path="/project/:projectid/contributions" element={<Contributions />} />
            <Route path="/project/:projectid/time" element={<Time />} />
            <Route path="/project/:projectid/times" element={<Timemaxi />} />
            <Route path="/fileupload" element={<FileUpload />} />
            </Routes>
            </Layout>
        </Router>
        </Provider>
        </DndProvider>  
    </div>
  )
}

export default App
