import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./LoadingPage.css";

function LoadingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      navigate("/dashboard", { replace: true });
    }, 1500);

    return () => window.clearTimeout(timer);
  }, [navigate]);

  return (
    <main className="loading-page">
      <div className="loading-content" role="status" aria-live="polite">
        <img
    className="auth-logo"
    src="/spoonful-logo.png"
    alt="Spoonful"
  />
        <p>Recipe Manager</p>
        <div className="loading-dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </div>
    </main>
  );
}

export default LoadingPage;