import React, { useState } from 'react';
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar/Sidebar';
import Navbar from './Navbar/Navbar';

const { Content } = Layout;

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout style={{ minHeight: '100vh', margin: 0 }}>
      
      {/* --- SIDEBAR --- */}
      <Sidebar collapsed={collapsed} />

      {/* --- MAIN CONTENT AREA --- */}
      <Layout style={{ background: '#f4f7fe' }}> 
        {/* TOP HEADER */}
        <Navbar collapsed={collapsed} setCollapsed={setCollapsed} />
        
        {/* PAGE CONTENT */}
        <Content style={{ margin: '24px', minHeight: 280 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;