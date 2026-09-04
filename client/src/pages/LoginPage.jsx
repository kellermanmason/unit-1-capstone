import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "./LoginPage.css";

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event) {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/api/users/login", {
        email: email.trim(),
        password,
      });

      const token = response.data.token || response.data.accessToken;

      if (!token) {
        throw new Error("No login token was returned.");
      }

      sessionStorage.setItem("token", token);
      navigate("/loading");
    } catch (loginError) {
      setError(
        loginError.response?.data?.message ||
          "Login failed. Check your email and password."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <header className="login-brand" aria-label="Spoonful home">
        <img
    className="auth-logo"
    src="/spoonful-logo.png"
    alt="Spoonful"
  />
      </header>

      <section className="login-content">
        <h1>Welcome Back!</h1>
        <p className="login-description">
          Log in to your account to continue
        </p>

        <form className="login-form" onSubmit={handleLogin}>
          <div className="form-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="Email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <div className="form-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />

            <button className="forgot-password" type="button">
              Forgot Password?
            </button>
          </div>

          {error && (
            <p className="login-error" role="alert">
              {error}
            </p>
          )}

          <button className="login-button" type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <Link className="account-button" to="/signup">
          Create an Account
        </Link>

        <Link className="explore-link" to="/recipes">
          Explore Recipes without Logging In
        </Link>
      </section>
    </main>
  );
}

export default LoginPage;

