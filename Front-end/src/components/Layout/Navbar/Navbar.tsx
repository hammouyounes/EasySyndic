import React from 'react';
import './Navbar.css';
import {
  SearchOutlined,
  BellOutlined,
  MenuOutlined,
  DownOutlined,
  SunOutlined,
  UserOutlined,
  SettingOutlined,
  InfoCircleOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import { Dropdown, type MenuProps } from 'antd';
import { useNavigate } from 'react-router-dom';
import profile from '../../../assets/images/profile.jpg';

// Simple Moon icon replacement if not using an icon library for everything
const MoonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
  </svg>
);

interface NavbarProps {
  brandText?: string;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  darkMode: boolean;
  toggleTheme: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ brandText, collapsed, setCollapsed, darkMode, toggleTheme }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : { nom: 'Musharof', prenom: 'Chowdhury', email: 'randomuser@pimjo.com' };
  const displayName = user.prenom ? `${user.prenom} ${user.nom}` : 'Musharof Chowdhury';

  const items: MenuProps['items'] = [
    {
      key: 'header',
      label: (
        <div style={{ display: 'flex', flexDirection: 'column', padding: '4px 0' }}>
          <span style={{ fontWeight: 600, fontSize: '14px', color: '#1f2937' }}>{displayName}</span>
          <span style={{ fontSize: '12px', color: '#9ca3af' }}>{user.email || 'randomuser@pimjo.com'}</span>
        </div>
      ),
      disabled: true,
      style: { cursor: 'default', backgroundColor: 'transparent' }
    },
    { type: 'divider' },
    {
      key: 'profile',
      label: 'Edit profile',
      icon: <UserOutlined />,
    },
    {
      key: 'settings',
      label: 'Account settings',
      icon: <SettingOutlined />,
    },
    {
      key: 'support',
      label: 'Support',
      icon: <InfoCircleOutlined />,
    },
    { type: 'divider' },
    {
      key: 'logout',
      label: 'Sign out',
      icon: <LogoutOutlined />,
      danger: true,
      onClick: handleLogout
    },
  ];

  return (
    <nav className="navbar-container">
      <div className="navbar-left">
        <button
          className="menu-button"
          onClick={() => setCollapsed(!collapsed)}
        >
          <MenuOutlined />
        </button>

        {brandText && (
          <span style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: darkMode ? '#ffffff' : '#1B2559'
          }}>
            {brandText}
          </span>
        )}

        <div className="search-wrapper">
          <SearchOutlined className="search-icon" />
          <input
            type="text"
            placeholder="Search or type command..."
            className="search-input"
          />
          <span className="command-key">⌘ K</span>
        </div>
      </div>

      <div className="navbar-right">
        <div className="icon-circle" onClick={toggleTheme}>
          {darkMode ? <SunOutlined /> : <MoonIcon />}
        </div>

        <div className="icon-circle">
          <BellOutlined />
          <span className="notification-dot"></span>
        </div>

        <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight" classNames={{ root: 'custom-dropdown' }}>
          <div className="profile-section">
            <img
              src={profile}
              alt="Profile"
              className="avatar"
            />
            <span className="profile-name">
              {user.prenom || 'youness'} <DownOutlined style={{ fontSize: '10px', color: '#2d72e8ff' }} />
            </span>
          </div>
        </Dropdown>
      </div>
    </nav>
  );
};

export default Navbar;