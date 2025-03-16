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
import Group from './containers/Group';
import View_invitation from './containers/View_invitation';


import Board from './containers/board';
import Activate from './containers/Activate';
import Resetpassword from './containers/Resetpassword';
import Resetpasswordconfirm from './containers/Resetpasswordconfirm';

import Layout from './hocs/Layout';
import { Provider } from 'react-redux';
import store from './store';
import Sprint from './containers/Sprint';
import Contributions from './containers/Contributions';
import MyIssues from './containers/MyIssues';
import Profile from './containers/Profile';
import Time from './containers/Time';
import ProtectedRoutes from "./components/ProtectedRoute"

import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Timemaxi from './containers/Timemaxi';
import FileUpload from './containers/FileUpload';
import JoinProject from './containers/JoinProject';



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
            <Route element={<ProtectedRoutes />}>
            <Route path="/activate/:uid/:token" element={<Activate/>} />
            <Route path="/reset_password" element={<Resetpassword/>} />
            <Route path="/view_invitation" element={<View_invitation />} />
            <Route path="/password/reset/confirm/:uid/:token" element={<Resetpasswordconfirm/>} />
            <Route path="/group" element={<Group/>} />
            <Route path="/group/:group_id/project" element={<Project />} /> 
          
            {/* <Route path="/project/:projectid" element={<ProjectPage />} /> */}
            <Route path="/group/:group_id/project/:projectid/boards" element={<Board />} />
            
            <Route path="/group/:group_id/project/:projectid/backlog" element={<DisplayBacklog/>} />
            <Route path="/group/:group_id/project/:projectid/filters" element={<Filters/>} />
            <Route path="/group/:group_id/project/:projectid/myissues" element={<MyIssues />} />
            <Route path="/group/:group_id/project/:projectid/profile" element={<Profile />} />
            <Route path="/group/:group_id/project/:projectid/contributions" element={<Contributions />} />
            <Route path="/group/:group_id/project/:projectid/time" element={<Time />} />
            <Route path="/group/:group_id/project/:projectid/times" element={<Timemaxi />} />
            <Route path="/fileupload" element={<FileUpload />} />
            <Route path="/join-project/:token" element={<JoinProject />} />

            </Route>
            </Routes>
            </Layout>

        </Router>
        </Provider>
        </DndProvider>  
    </div>
  )
}

export default App
