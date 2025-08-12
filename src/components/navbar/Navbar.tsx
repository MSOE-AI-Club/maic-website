import React, { useState } from "react";
import { Menu, MenuItem, IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import "./css/navbar.css";
import { Link, useLocation } from "react-router-dom";

/**
 * The NavBarProps interface represents the props that the NavBar component receives.
 */
interface NavBarProps {
  page: string;
}

/**
 * The NavBar component displays the navigation bar of the website.
 * @param {NavBarProps} props - The props to be passed to the NavBar component.
 * @returns {JSX.Element} The NavBar component.
 */
const NavBar = (props: NavBarProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const { pathname } = useLocation();

  const isActive = (to: string): boolean => {
    if (to === "/") return pathname === "/";
    return pathname === to || pathname.startsWith(`${to}/`);
  };

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // Links handle navigation; just close the menu on click
  const handleNavigation = () => handleClose();

  return (
    <div id="toolbar" style={{ textAlign: "center" }}>
      <h3>
          <img
            className="logo"
            src="/Logo.png"
            alt="Logo"
            height="25px"
            style={{
              float: "left",
              paddingRight: "10px",
              paddingTop: "5px",
              paddingBottom: "5px",
            }}
          />
      </h3>
      
      {/* Desktop Navigation */}
      <div className="desktop-nav">
        <Link className={`${isActive("/") ? "active" : ""}`} to="/">
          <p>Home</p>
        </Link>
        <Link className={`${isActive("/library") ? "active" : ""}`} to="/library">
          <p>Library</p>
        </Link>
        <Link className={`${isActive("/learning-tree") ? "active" : ""}`} to="/learning-tree">
          <p>Learning Tree</p>
        </Link>
        <Link className={`${isActive("/events") ? "active" : ""}`} to="/events">
          <p>Events</p>
        </Link>
        <Link className={`${isActive("/merch") ? "active" : ""}`} to="/merch">
          <p>Merch</p>
        </Link>
        <Link className={`${isActive("/contact") ? "active" : ""}`} to="/contact">
          <p>Contact</p>
        </Link>
        <Link className={`${isActive("/about") ? "active" : ""}`} to="/about">
          <p>About</p>
        </Link>
      </div>

      {/* Mobile Navigation */}
      <div className="mobile-nav">
        <IconButton
          size="large"
          aria-label="menu"
          aria-controls={open ? 'mobile-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          onClick={handleMenu}
          className="mobile-menu-button"
        >
          <MenuIcon />
        </IconButton>
        
        <Menu
          id="mobile-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          MenuListProps={{
            'aria-labelledby': 'mobile-menu-button',
          }}
          className="mobile-menu-dropdown"
        >
          <MenuItem onClick={handleNavigation} component={Link} to="/" className={isActive("/") ? "active" : ""}>Home</MenuItem>
          <MenuItem onClick={handleNavigation} component={Link} to="/library" className={isActive("/library") ? "active" : ""}>Library</MenuItem>
          <MenuItem onClick={handleNavigation} component={Link} to="/learning-tree" className={isActive("/learning-tree") ? "active" : ""}>Learning Tree</MenuItem>
          <MenuItem onClick={handleNavigation} component={Link} to="/events" className={isActive("/events") ? "active" : ""}>Events</MenuItem>
          <MenuItem onClick={handleNavigation} component={Link} to="/merch" className={isActive("/merch") ? "active" : ""}>Merch</MenuItem>
          <MenuItem onClick={handleNavigation} component={Link} to="/contact" className={isActive("/contact") ? "active" : ""}>Contact</MenuItem>
          <MenuItem onClick={handleNavigation} component={Link} to="/about" className={isActive("/about") ? "active" : ""}>About</MenuItem>
        </Menu>
      </div>
    </div>
  );
};

export default NavBar;