import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import ProtectedRoutes from './components/ProtectedRoute';
import Layout from './hocs/Layout';
import store from './store';

// Public Pages
import Home from './containers/Home';
import Login from './containers/Login';
import Signup from './containers/Signup';
import Activate from './containers/Activate';
import Resetpassword from './containers/Resetpassword';
import Resetpasswordconfirm from './containers/Resetpasswordconfirm';
import View_invitation from './containers/View_invitation';
import JoinProject from './containers/JoinProject';

// Protected Pages (Require Authentication)
import Group from './containers/Group';
import Project from './containers/Project';
import ProjectPage from './containers/ProjectPage';
import Board from './containers/board';
import DisplayBacklog from './containers/DisplayBacklog';
import Filters from './containers/Filters';
import Sprint from './containers/Sprint';
import Contributions from './containers/Contributions';
import MyIssues from './containers/MyIssues';
import Profile from './containers/Profile';
import Time from './containers/Time';
import Timemaxi from './containers/Timemaxi';
import FileUpload from './containers/FileUpload';
import AcceptInvitation from './containers/AcceptInvitation';
import ChangeProjectName from './containers/ChangeProjectName'; 

const App = () => {
  return (
    <DndProvider backend={HTML5Backend}>
      <Provider store={store}>
        <Router>
          <Layout>
            <Routes>

              {/* 🔹 Public Routes (No Authentication Required) */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/activate/:uid/:token" element={<Activate />} />
              <Route path="/reset_password" element={<Resetpassword />} />
              <Route path="/password/reset/confirm/:uid/:token" element={<Resetpasswordconfirm />} />
              <Route path="/view_invitation" element={<View_invitation />} />

          
              <Route path="/join-project/:token" element={<JoinProject />} />
              <Route path="/accept-invitation" element={<AcceptInvitation />} />

              {/* 🔹 Protected Routes (Require Authentication) */}
              <Route element={<ProtectedRoutes />}>
                <Route path="/group" element={<Group />} />
                <Route path="/group/:group_id/project" element={<Project />} />
                <Route path="/group/:group_id/project/:projectid/boards" element={<Board />} />
                <Route path="/group/:group_id/project/:projectid/backlog" element={<DisplayBacklog />} />
                <Route path="/group/:group_id/project/:projectid/filters" element={<Filters />} />
                <Route path="/group/:group_id/project/:projectid/myissues" element={<MyIssues />} />
                <Route path="/group/:group_id/project/:projectid/profile" element={<Profile />} />
                <Route path="/group/:group_id/project/:projectid/contributions" element={<Contributions />} />
                <Route path="/group/:group_id/project/:projectid/time" element={<Time />} />
                <Route path="/group/:group_id/project/:projectid/times" element={<Timemaxi />} />
                <Route path="/fileupload" element={<FileUpload />} />
               
             

              </Route>

            </Routes>
          </Layout>
        </Router>
      </Provider>
    </DndProvider>
  );
};

export default App;
