import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './components/Layout/MainLayout';
import BuildingList from './pages/Buildings/BuildingList';
import ApartmentList from './pages/Apartments/ApartmentList.tsx';
import UserList from './pages/Users/UserList';



// import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Login from './pages/Auth/Login';

// Placeholder Pages (We will build these later)
const Dashboard = () => <h1>Dashboard Stats (To Do)</h1>;
const Payments = () => <h1>Payments List (To Do)</h1>;

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC ROUTES */}
        {/* <Route path="/" element={<Home />} /> */}
        {/* <Route path="/login" element={<Login />} /> */}
        <Route path="/register" element={<Register />} />
          <Route path="Login" element={<Login />} />
        
        {/* PROTECTED ROUTES (Sidebar Layout) */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="buildings" element={<BuildingList />} />
          <Route path="apartments" element={<ApartmentList />} />
          <Route path="users" element={<UserList />} />
          <Route path="payments" element={<Payments />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;