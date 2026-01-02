import React from 'react';
import { Breadcrumb, Avatar, Dropdown, type MenuProps } from 'antd';
import { 
  SearchOutlined, 
  BellOutlined, 
  InfoCircleOutlined, 
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MoonOutlined,
  SunOutlined
} from '@ant-design/icons';
import './Navbar.css'; // Import the CSS file above

interface NavbarProps {
  brandText?: string;
  currentRoute?: string;
  avatarUrl?: string; // Optional URL for image, otherwise uses initials
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  darkMode: boolean;
  toggleTheme: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ 
  brandText = "Main Dashboard", 
  currentRoute = "Pages",
  avatarUrl,
  collapsed,
  setCollapsed,
  darkMode,
  toggleTheme
}) => {
  // Local state for dark mode removed, using props instead

  // Dropdown menu for the avatar
  const items: MenuProps['items'] = [
    { key: '1', label: 'Profile' },
    { key: '2', label: 'Settings' },
    { key: '3', label: 'Logout', danger: true },
  ];

  return (
    <nav className="horizon-navbar">
      
      {/* --- Left Side: Breadcrumbs & Title --- */}
      <div className="navbar-left">
        <div 
          className="cursor-pointer" 
          onClick={() => setCollapsed(!collapsed)}
          style={{ marginRight: '16px', fontSize: '18px' }}
        >
          
          {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          <Breadcrumb 
            items={[
              {
                title: <span className="crumb-light">{currentRoute}</span>,
                href: '#'
              },
              {
                title: <span className="crumb-bold">{brandText}</span>,
              }
            ]}
          />
        </div>
        <div className="navbar-breadcrumb">
          
        </div>
      </div>

      {/* --- Right Side: Controls Pill --- */}
      <div className="navbar-controls">
        
        {/* Search Wrapper */}
        <div className="search-wrapper">
          <SearchOutlined className="search-icon" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="search-input" 
          />
        </div>

        {/* Icons */}
        <BellOutlined className="nav-icon" />
        <InfoCircleOutlined className="nav-icon" />
        
        {/* Theme Toggle */}
        <div className="nav-icon" onClick={toggleTheme} style={{ display: 'flex', alignItems: 'center' }}>
          {darkMode ? <SunOutlined /> : <MoonOutlined />}
        </div>

        {/* Avatar with Dropdown */}
        <Dropdown menu={{ items }} trigger={['click']}>
            <Avatar 
              src={avatarUrl} 
              size="large" 
              className="nav-avatar"
              icon={!avatarUrl && <UserOutlined />}
            >
              {!avatarUrl && "US"} {/* Initials if no image */}
            </Avatar>
        </Dropdown>
      </div>

    </nav>
  );
};

export default Navbar;