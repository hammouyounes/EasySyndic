import React from 'react';
import { Layout, Menu } from 'antd';
import { 
  AppstoreOutlined, 
  ShopOutlined, 
  TeamOutlined, 
  WalletOutlined, 
  UserOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../../../assets/images/logoEs2.png';

const { Sider } = Layout;


interface SidebarProps {
  collapsed: boolean;
  darkMode: boolean;
}

import './Sidebar.css';

const Sidebar: React.FC<SidebarProps> = ({ collapsed, darkMode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const userString = localStorage.getItem('user');
  const currentUser = userString ? JSON.parse(userString) : null;
  
  // --- DESIGN SYSTEM ---
  // Using CSS variables for dynamic theming
  const sidebarColor = 'var(--bg-secondary)'; 
  const sidebarTextColor = 'var(--text-secondary)';

  return (
    <Sider 
      trigger={null} 
      collapsible 
      collapsed={collapsed}
      width={260} // Wider sidebar looks more premium
      style={{ 
        background: sidebarColor,
        boxShadow: darkMode ? '4px 0 24px rgba(0,0,0,0.4)' : '4px 0 24px rgba(112, 144, 176, 0.08)',
        zIndex: 10,
        transition: 'all 0.3s ease'
      }}
    >
      <div className="sidebar-logo-container">
           <img 
             src={logo} 
             alt="Company Logo" 
             className="logo-icon"
             style={{ paddingLeft: !collapsed ? '30px' : '0px' }}
           />
           {!collapsed && <span className="logo-text">eSyndic</span>}
      </div>

      {/* 2. MENU */}
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        onClick={(e) => navigate(e.key)}
        style={{ 
          background: 'transparent', 
          border: 'none', 
          marginTop: 20,
          padding: '0 12px'
        }}
        theme={darkMode ? "dark" : "light"} // Toggle Ant Design Menu theme

        items={[
          { 
            key: 'g1', label: <span style={{ color: sidebarTextColor, fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>MENU</span>, 
            type: 'group',
            children: [
              { key: '/', icon: <AppstoreOutlined />, label: 'Dashboard' },
            ]
          },

          // SECTION 2: MANAGEMENT
          { 
            key: 'g2', label: <span style={{ color: sidebarTextColor, fontSize: 11, fontWeight: 700, letterSpacing: 1, marginTop: 20 }}>ESTATE</span>, 
            type: 'group',
            children: [
              { key: '/buildings', icon: <ShopOutlined />, label: 'Buildings' },
              // Hide Apartments for Super Admin
              ...(currentUser?.role !== 'SUPERADMIN' ? [{ key: '/apartments', icon: <TeamOutlined />, label: 'Apartments & Owners' }] : []),
              { key: '/charges', icon: <WalletOutlined />, label: 'Charges' },
              // Super Admin manages Syndics, Normal Admin manages Owners
              { key: '/users', icon: <UserOutlined />, label: 'Users' },
              // Hide Appels for Super Admin
              ...(currentUser?.role !== 'SUPERADMIN' ? [{ key: '/appel-charges', icon: <WalletOutlined />, label: 'Appels & Paiements' }] : []),
            ]
          },
        ]}
      />
      
    </Sider>
  );
};

export default Sidebar;
