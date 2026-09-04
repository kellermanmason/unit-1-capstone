import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "./SignupPage.css";

function SignupPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  function validateForm() {
    const nextErrors = {};

    if (!email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = "Please enter a valid email address.";
    }

    if (!password) {
      nextErrors.password = "Password is required.";
    } else if (password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters.";
    }

    return nextErrors;
  }

  async function handleSignup(event) {
    event.preventDefault();

    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);

    try {
      const response = await api.post("/api/users/signup", {
        email: email.trim(),
        password,
      });

      const token = response.data.token || response.data.accessToken;

      if (token) {
        sessionStorage.setItem("token", token);
        navigate("/loading");
      } else {
        navigate("/login");
      }
    } catch (signupError) {
      setErrors({
        form:
          signupError.response?.data?.message ||
          signupError.response?.data?.error ||
          "Unable to create your account.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="signup-page">
      <header className="signup-brand" aria-label="Spoonful home">
        <img
    className="auth-logo"
    src="/spoonful-logo.png"
    alt="Spoonful"
  />
      </header>

      <section className="signup-content">
        <h1>Create an Account</h1>

        <form className="signup-form" onSubmit={handleSignup} noValidate>
          <div className="signup-field">
            <label
  htmlFor="email"
  className={errors.email ? "signup-label-error" : ""}
>Username</label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              aria-invalid={Boolean(errors.email)}
              placeholder="Username"
              autoComplete="email"
            />
            {errors.email && (
              <p className="signup-field-error">{errors.email}</p>
            )}
          </div>
          <div className="signup-field">
            <label
  htmlFor="password"
  className={errors.password ? "signup-label-error" : ""}
>Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              aria-invalid={Boolean(errors.password)}
              placeholder="Password"
              autoComplete="new-password"
            />
            {errors.password && (
              <p className="signup-field-error">{errors.password}</p>
            )}
          </div>

          {errors.form && (
            <p className="signup-form-error" role="alert">
              {errors.form}
            </p>
          )}

          <button className="signup-button" type="submit" disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <Link className="cancel-button" to="/">
          Cancel
        </Link>
      </section>
    </main>
  );
}

export default SignupPage;