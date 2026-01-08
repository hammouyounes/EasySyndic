import React from 'react';
import { Layout, Menu, Avatar, Typography } from 'antd';
import { 
  AppstoreOutlined, 
  WalletOutlined, 
  HomeOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../../../assets/images/logoEs2.png';
import './Sidebar.css';

const { Sider } = Layout;
const { Text } = Typography;

interface SidebarProps {
  collapsed: boolean;
  darkMode: boolean;
}

const ProprietaireSidebar: React.FC<SidebarProps> = ({ collapsed, darkMode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Using CSS variables for dynamic theming
  const sidebarColor = 'var(--bg-secondary)'; 
  const sidebarTextColor = 'var(--text-secondary)';

  return (
    <Sider 
      trigger={null} 
      collapsible 
      collapsed={collapsed}
      width={260}
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
        theme={darkMode ? "dark" : "light"}
        items={[
          { 
            key: 'g1', label: <span style={{ color: sidebarTextColor, fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>MENU</span>, 
            type: 'group',
            children: [
              { key: '/proprietaire', icon: <AppstoreOutlined />, label: 'Tableau de bord' },
            ]
          },
          { 
            key: 'g2', label: <span style={{ color: sidebarTextColor, fontSize: 11, fontWeight: 700, letterSpacing: 1, marginTop: 20 }}>MES BIENS</span>, 
            type: 'group',
            children: [
              { key: '/proprietaire/payments', icon: <WalletOutlined />, label: 'Mes Paiements' },
              { key: '/proprietaire/apartments', icon: <HomeOutlined />, label: 'Mes Appartements' },
            ]
          },
        ]}
      />

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
          <Avatar size="large" src="https://ui-avatars.com/api/?name=Proprietaire&background=10B981&color=fff" />
          <div style={{ lineHeight: 1.2 }}>
            <Text strong style={{ color: 'var(--text-primary)', display: 'block' }}>Propriétaire</Text>
            <Text style={{ color: 'var(--text-secondary)', fontSize: 11 }}>Espace Client</Text>
          </div>
        </div>
      )}
    </Sider>
  );
};

export default ProprietaireSidebar;
