import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  return (
    <nav className="landing-navbar" aria-label="Main navigation">
      <Link className="landing-navbar-brand" to="/">
       <img
    className="auth-logo"
    src="/spoonful-logo.png"
    alt="Spoonful"
  />
      </Link>

      <div className="landing-navbar-links">
        <Link to="/ai-assistant">AI Assistant</Link>
      </div>
    </nav>
  );
}

export default Navbar;