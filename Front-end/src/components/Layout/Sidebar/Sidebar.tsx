import React from 'react';
import { Layout, Menu, Avatar, Typography } from 'antd';
import { 
  AppstoreOutlined, 
  ShopOutlined, 
  TeamOutlined, 
  WalletOutlined, 
  SettingOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const { Sider } = Layout;
const { Text } = Typography;

interface SidebarProps {
  collapsed: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // --- DESIGN SYSTEM ---
  // The exact "Flowdash" Navy Blue
  const sidebarColor = '#111c44'; 
  const sidebarTextColor = '#a0aec0';
  const sidebarActiveColor = '#fff'; // Kept for reference if needed
  const accentColor = '#7551FF'; // A nice purple/blue accent for active items

  return (
    <Sider 
      trigger={null} 
      collapsible 
      collapsed={collapsed}
      width={260} // Wider sidebar looks more premium
      style={{ 
        background: sidebarColor,
        boxShadow: '4px 0 24px rgba(0,0,0,0.2)',
        zIndex: 10
      }}
    >
      {/* 1. LOGO AREA */}
      <div style={{ 
        height: 90, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        borderBottom: '1px solid rgba(255,255,255,0.05)' 
      }}>
         <div style={{ 
           display: 'flex', 
           alignItems: 'center', 
           gap: 10, 
           color: 'white', 
           fontWeight: 'bold', 
           fontSize: 20,
           letterSpacing: '1px'
         }}>
           <div style={{ 
             width: 32, height: 32, background: accentColor, borderRadius: 8,
             display: 'flex', alignItems: 'center', justifyContent: 'center'
           }}>S</div>
           {!collapsed && "SYNDIC PRO"}
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
        theme="dark" // Using dark theme for correct hover effects
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
              { key: '/payments', icon: <WalletOutlined />, label: 'Finance & Payments' },
            ]
          },

          // SECTION 3: SYSTEM
          { 
            key: 'g3', label: <span style={{ color: sidebarTextColor, fontSize: 11, fontWeight: 700, letterSpacing: 1, marginTop: 20 }}>SYSTEM</span>, 
            type: 'group',
            children: [
              { key: '/settings', icon: <SettingOutlined />, label: 'Settings' },
              { key: '/login', icon: <LogoutOutlined style={{ color: '#ff4d4f' }} />, label: <span style={{ color: '#ff4d4f' }}>Logout</span> },
            ]
          },
        ]}
      />

      {/* 3. CREATIVE PROFILE CARD AT BOTTOM */}
      {!collapsed && (
        <div style={{
          position: 'absolute',
          bottom: 30,
          left: 20,
          right: 20,
          background: 'rgba(255,255,255,0.05)',
          borderRadius: 16,
          padding: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          backdropFilter: 'blur(10px)'
        }}>
          <Avatar size="large" src="https://ui-avatars.com/api/?name=Admin+Syndic&background=7551FF&color=fff" />
          <div style={{ lineHeight: 1.2 }}>
            <Text strong style={{ color: 'white', display: 'block' }}>Hassan Admin</Text>
            <Text style={{ color: sidebarTextColor, fontSize: 11 }}>Syndic Manager</Text>
          </div>
        </div>
      )}
    </Sider>
  );
};

export default Sidebar;
