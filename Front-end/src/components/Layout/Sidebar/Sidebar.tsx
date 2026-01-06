import React from 'react';
import { Layout, Menu, Avatar, Typography } from 'antd';
import { 
  AppstoreOutlined, 
  ShopOutlined, 
  TeamOutlined, 
  WalletOutlined, 
  SettingOutlined,
  LogoutOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../../../assets/images/logo2 (1).png';
import logo1 from '../../../assets/images/logo22.png';

const { Sider } = Layout;
const { Text } = Typography;


interface SidebarProps {
  collapsed: boolean;
  darkMode: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, darkMode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // --- DESIGN SYSTEM ---
  // Using CSS variables for dynamic theming
  const sidebarColor = 'var(--bg-secondary)'; 
  const sidebarTextColor = 'var(--text-secondary)';
  const accentColor = 'var(--accent, #7551FF)'; 

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
      <div style={{ 
        height: 90, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}` 
      }}>
         <div style={{ 
           display: 'flex', 
           alignItems: 'center', 
           gap: 10, 
           color: 'var(--text-primary)', 
           fontWeight: 'bold', 
           fontSize: 20,
           letterSpacing: '1px'
         }}>
           <img 
             src={collapsed ? logo1 : logo} 
             alt="Company Logo" 
             style={{ 
               width: collapsed ? 80 : 85, 
               height: 'auto', 
               transition: 'all 0.3s ease' 
             }} 
           />
           {!collapsed && "eSyndic"}
         </div>
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
          // SECTION 1: MAIN
          { 
            key: 'g1', label: <span style={{ color: sidebarTextColor, fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>MENU</span>, 
            type: 'group',
            children: [
              { key: '/', icon: <AppstoreOutlined />, label: 'Dashboard' },
            ]
          },

          // SECTION 2: MANAGEMENT (Your Core Features)
          { 
            key: 'g2', label: <span style={{ color: sidebarTextColor, fontSize: 11, fontWeight: 700, letterSpacing: 1, marginTop: 20 }}>ESTATE</span>, 
            type: 'group',
            children: [
              { key: '/buildings', icon: <ShopOutlined />, label: 'Buildings' },
              { key: '/apartments', icon: <TeamOutlined />, label: 'Apartments & Owners' },
              { key: '/charges', icon: <WalletOutlined />, label: 'Charges' },
              { key: '/users', icon: <UserOutlined />, label: 'Users' },
              { key: '/appel-charges', icon: <WalletOutlined />, label: 'Appels & Paiements' },
            ]
          },

          // SECTION 3: SYSTEM
          // { 
          //   key: 'g3', label: <span style={{ color: sidebarTextColor, fontSize: 11, fontWeight: 700, letterSpacing: 1, marginTop: 20 }}>SYSTEM</span>, 
          //   type: 'group',
          //   children: [
          //     { key: '/settings', icon: <SettingOutlined />, label: 'Settings' },
          //   ]
          // },
        ]}
      />

      {/* 3. CREATIVE PROFILE CARD AT BOTTOM */}
      {/* 3. CREATIVE PROFILE CARD AT BOTTOM */}
      {!collapsed && (
        <div style={{
          position: 'absolute',
          bottom: 30,
          left: 20,
          right: 20,
          background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
          borderRadius: 16,
          padding: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          backdropFilter: 'blur(10px)',
          transition: 'background 0.3s ease'
        }}>
          <Avatar size="large" src="https://ui-avatars.com/api/?name=Admin+Syndic&background=7551FF&color=fff" />
          <div style={{ lineHeight: 1.2 }}>
            <Text strong style={{ color: 'var(--text-primary)', display: 'block' }}>Hassan Admin</Text>
            <Text style={{ color: 'var(--text-secondary)', fontSize: 11 }}>Syndic Manager</Text>
          </div>
        </div>
      )}
    </Sider>
  );
};

export default Sidebar;
