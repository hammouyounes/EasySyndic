import React, { useState, useEffect } from 'react';
import { Layout, ConfigProvider, theme } from 'antd';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar/Sidebar';
import Navbar from './Navbar/Navbar';

const { Content } = Layout;

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Check local storage or system preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.body.classList.add('dark');
    } else {
      setDarkMode(false);
      document.body.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (darkMode) {
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setDarkMode(false);
    } else {
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setDarkMode(true);
    }
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: darkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: '#7551FF', // Brand Purple
          fontFamily: "'DM Sans', sans-serif",
          
          // Dynamic Colors based on mode
          ...(darkMode ? {
            colorBgLayout: '#0b1437',     // Main Background
            colorBgContainer: '#111c44',  // Card/Table Background
            colorBgElevated: '#1B2559',   // Dropdowns/Modals
            colorText: '#ffffff',
            colorTextSecondary: '#a0aec0',
            colorBorder: 'rgba(255,255,255,0.1)',
          } : {
            colorBgLayout: '#f4f7fe',
            colorBgContainer: '#ffffff',
            colorText: '#1B2559',
            colorTextSecondary: '#a0aec0',
          })
        },
        components: {
          Table: {
            headerBg: darkMode ? '#1B2559' : '#fafafa',
            headerColor: darkMode ? '#ffffff' : 'rgba(0, 0, 0, 0.88)',
          },
          Card: {
            headerBg: 'transparent',
          }
        }
      }}
    >
      <Layout style={{ minHeight: '100vh', margin: 0 }}>
        
        {/* --- SIDEBAR --- */}
        <Sidebar collapsed={collapsed} darkMode={darkMode} />

        {/* --- MAIN CONTENT AREA --- */}
        <Layout style={{ background: 'var(--bg-primary)', transition: 'background 0.3s ease' }}> 
          {/* TOP HEADER */}
          <Navbar 
            collapsed={collapsed} 
            setCollapsed={setCollapsed} 
            darkMode={darkMode} 
            toggleTheme={toggleTheme} 
          />
          
          {/* PAGE CONTENT */}
          <Content style={{ margin: '24px', minHeight: 280 }}>
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};

export default MainLayout;