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
  /**
   * The NavBar component.
   */

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
      <Link
        className={`${props.page === "Home" ? "active" : ""}`}
        to="/"
      >
        <p>Home</p>
      </Link>
      <Link
        className={`${props.page === "Library" ? "active" : ""}`}
        to="/library"
      >
        <p>Library</p>
      </Link>
      <Link
        className={`${props.page === "Learning Tree" ? "active" : ""}`}
        to="/learning-tree"
      >
        <p>Learning Tree</p>
      </Link>
      <Link
        className={`${props.page === "Events" ? "active" : ""}`}
        to="/events"
      >
        <p>Events</p>
      </Link>
      <Link
        className={`${props.page === "Merch" ? "active" : ""}`}
        to="/merch"
      >
        <p>Merch</p>
      </Link>
      <Link
        className={`${props.page === "Contact" ? "active" : ""}`}
        to="/contact"
      >
        <p>Contact</p>
      </Link>
      <Link
        className={`${props.page === "About" ? "active" : ""}`}
        to="/about"
      >
        <p>About</p>
      </Link>
    </div>
  );
};

export default NavBar;