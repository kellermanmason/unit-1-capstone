import { Link } from "react-router-dom";
import "./LandingPage.css";

function LandingPage() {
  return (
    <main className="landing-page">
      <header className="landing-brand" aria-label="Spoonful home">
        <span className="brand-mark" aria-hidden="true">
          S
        </span>
        <span>spoonful</span>
      </header>

      <section className="landing-content">

        <h1>Welcome Back!</h1>

        <p className="landing-description">
          Log in to your account to continue
        </p>

        <div className="landing-actions">
          <Link className="landing-button landing-button-primary" to="/login">
        Login
          </Link>

          <Link className="landing-button landing-button-secondary" to="/signup">
            Create an Account
          </Link>

          <Link className="landing-ai-link" to="/recipes">
            Explore Recipes without Logging In
          </Link>
        </div>
      </section>
    </main>
  );
}

export default LandingPage;