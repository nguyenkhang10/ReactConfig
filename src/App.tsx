import './App.css';
import Login from './Login';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CreateProjects from './projects/CreateProjects';
import Projects from './projects/Projects';
import SearchProjects from './projects/SearchProjects';
import GetProject from './projects/GetProject';
import UpdateProject from './projects/UpdateProject';
import DeleteProject from './projects/DeleteProject';
import Tasks from './tasks/Tasks';
import CreateTask from './tasks/CreateTask';
import UpdateTask from './tasks/UpdateTask';
import DeleteTask from './tasks/DeleteTask';
import SearchTask from './tasks/SearchTask';
import Users from './users/Users';
import CreateUser from './users/CreateUser';
import UpdateUser from './users/UpdateUser';
import DeleteUser from './users/DeleteUser';
import SearchUser from './users/SearchUser';

function App() {
  return (
    <BrowserRouter>
      {/* Routes */}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/create-projects" element={<CreateProjects />} />
        <Route path="/search-projects" element={<SearchProjects />} />
        <Route path="/get-project" element={<GetProject />} />
        <Route path="/get-project/:id" element={<GetProject />} />
        <Route path="/projects/:id" element={<GetProject />} />
        <Route path="/update-project" element={<UpdateProject />} />
        <Route path="/update-project/:id" element={<UpdateProject />} />
        <Route path="/delete-project" element={<DeleteProject />} />
        <Route path="/delete-project/:id" element={<DeleteProject />} />

        {/* Task Routes - Project-first model */}
        <Route path="/projects/:projectId/tasks" element={<Tasks />} />
        <Route path="/projects/:projectId/tasks/create" element={<CreateTask />} />
        <Route path="/projects/:projectId/tasks/edit/:taskId" element={<UpdateTask />} />
        <Route path="/projects/:projectId/tasks/delete/:taskId" element={<DeleteTask />} />
        <Route path="/projects/:projectId/tasks/search" element={<SearchTask />} />

        {/* Fallback / Standalone Task Routes */}
        <Route path="/tasks" element={<SearchTask />} />
        <Route path="/tasks/search" element={<SearchTask />} />
        <Route path="/tasks/create" element={<CreateTask />} />
        <Route path="/tasks/edit/:taskId" element={<UpdateTask />} />
        <Route path="/tasks/delete/:taskId" element={<DeleteTask />} />

        {/* User Routes - Standalone User CRUD */}
        <Route path="/users" element={<Users />} />
        <Route path="/users/create" element={<CreateUser />} />
        <Route path="/users/edit/:id" element={<UpdateUser />} />
        <Route path="/users/delete/:id" element={<DeleteUser />} />
        <Route path="/users/search" element={<SearchUser />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
