import "../assets/css/navbar.css";

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
        <a href="/">
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
        </a>
      </h3>
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
        className={`${props.page === "Earning Tree" ? "active" : ""}`}
        href="/learning-tree"
      >
        <p>Learning Tree</p>
      </a>
      <a
        className={`${props.page === "Workshops" ? "active" : ""}`}
        href="/workshops"
      >
        <p>Workshops</p>
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
  );
};

export default NavBar;