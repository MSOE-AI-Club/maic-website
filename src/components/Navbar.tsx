import React, { useState } from "react";
import { Menu, MenuItem, IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import "../assets/css/navbar.css";
import { Link } from "react-router-dom";

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

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNavigation = (href: string) => {
    handleClose();
    window.location.href = href;
  };

  return (
    <div id="toolbar" style={{ textAlign: "center" }}>
      <h3>
        <Link to="/">
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
        </Link>
      </h3>
      
      {/* Desktop Navigation */}
      <div className="desktop-nav">
        <a
          className={`${props.page === "Home" ? "active" : ""}`}
          href="/"
        >
          <p>Home</p>
        </a>
        <a
          className={`${props.page === "Library" ? "active" : ""}`}
          href="/library"
        >
          <p>Library</p>
        </a>
        <a
          className={`${props.page === "Learning Tree" ? "active" : ""}`}
          href="/learning-tree"
        >
          <p>Learning Tree</p>
        </a>
        <a
          className={`${props.page === "Events" ? "active" : ""}`}
          href="/events"
        >
          <p>Events</p>
        </a>
        <a
          className={`${props.page === "Merch" ? "active" : ""}`}
          href="/merch"
        >
          <p>Merch</p>
        </a>
        <a
          className={`${props.page === "Contact" ? "active" : ""}`}
          href="/contact"
        >
          <p>Contact</p>
        </a>
        <a
          className={`${props.page === "About" ? "active" : ""}`}
          href="/about"
        >
          <p>About</p>
        </a>
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
          <MenuItem 
            onClick={() => handleNavigation('/')}
            className={props.page === "Home" ? "active" : ""}
          >
            Home
          </MenuItem>
          <MenuItem 
            onClick={() => handleNavigation('/library')}
            className={props.page === "Library" ? "active" : ""}
          >
            Library
          </MenuItem>
          <MenuItem 
            onClick={() => handleNavigation('/learning-tree')}
            className={props.page === "Learning Tree" ? "active" : ""}
          >
            Learning Tree
          </MenuItem>
          <MenuItem 
            onClick={() => handleNavigation('/events')}
            className={props.page === "Events" ? "active" : ""}
          >
            Events
          </MenuItem>
          <MenuItem 
            onClick={() => handleNavigation('/merch')}
            className={props.page === "Merch" ? "active" : ""}
          >
            Merch
          </MenuItem>
          <MenuItem 
            onClick={() => handleNavigation('/contact')}
            className={props.page === "Contact" ? "active" : ""}
          >
            Contact
          </MenuItem>
          <MenuItem 
            onClick={() => handleNavigation('/about')}
            className={props.page === "About" ? "active" : ""}
          >
            About
          </MenuItem>
        </Menu>
      </div>
    </div>
  );
};

export default NavBar;