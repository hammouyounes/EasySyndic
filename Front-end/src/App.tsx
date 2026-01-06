import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './components/Layout/MainLayout';
import BuildingList from './pages/admin/Buildings/BuildingList';
import ApartmentList from './pages/admin/Apartments/ApartmentList';
import UserList from './pages/Users/UserList';
import ChargeList from './pages/admin/Charges/ChargeList';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import AppelChargeList from './pages/admin/AppelCharges/AppelChargeList';

// Placeholder Pages (We will build these later)
const Dashboard = () => <h1>Dashboard Stats (To Do)</h1>;

import ProtectedRoute from './components/ProtectedRoute';
import ProprietaireLayout from './components/Layout/ProprietaireLayout';
import ProprietaireDashboard from './pages/Proprietaire/ProprietaireDashboard';

import ProprietaireApartmentList from './pages/Proprietaire/ProprietaireApartmentList';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />



        {/* PROTECTED ROUTES (Sidebar Layout) */}
        {/* PROTECTED ROUTES (Sidebar Layout) */}
        
        {/* ADMIN SIDE */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="buildings" element={<BuildingList />} />
            <Route path="apartments" element={<ApartmentList />} />
            <Route path="users" element={<UserList />} />
            <Route path="charges" element={<ChargeList />} />
            <Route path="appel-charges" element={<AppelChargeList />} />
          </Route>
        </Route>

        {/* PROPRIETAIRE SIDE */}
        <Route element={<ProtectedRoute allowedRoles={['proprietaire']} />}>
          <Route path="/proprietaire" element={<ProprietaireLayout />}>
            <Route index element={<ProprietaireDashboard />} />
            <Route path="payments" element={<h1>Mes Paiements (To Do)</h1>} />
            <Route path="apartments" element={<ProprietaireApartmentList />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;