import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "./LoginPage.css";

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({
  email: "",
  password: "",
  form: "",
});
  const [loading, setLoading] = useState(false);

  function validateLogin() {
  const nextErrors = {};

  if (!email.trim()) {
    nextErrors.email = "Please enter a valid email address. We couldn't find your account. Please try again.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    nextErrors.email = "Please enter a valid email address. We couldn't find your account. Please try again.";
  }

  if (!password) {
    nextErrors.password = "Your password doesn't match our records. Please try again.";
  }

  return nextErrors;
}

  async function handleLogin(event) {
  event.preventDefault();

  const validationErrors = validateLogin();

  setErrors({
    email: validationErrors.email || "",
    password: validationErrors.password || "",
    form: "",
  });

  if (Object.keys(validationErrors).length > 0) {
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

    navigate("/loading", {
      state: {
        redirectTo: "/dashboard",
      },
    });
  } catch (loginError) {
  const responseData = loginError.response?.data;
  const serverErrors = responseData?.errors || {};

  setErrors({
    email: serverErrors.email || responseData?.email || "",
    password:
      serverErrors.password ||
      responseData?.password ||
      "Your password doesn't match our records. Please try again.",
    form: "",
  });
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

        <form className="login-form" onSubmit={handleLogin} noValidate>
          <div className="form-field">
  <label
  htmlFor="email"
  className={errors.email || errors.form ? "field-error" : ""}
>
  Email
</label>

<input
  id="email"
  type="email"
  placeholder="Email"
  autoComplete="email"
  value={email}
  aria-invalid={Boolean(errors.email || errors.form)}
  aria-describedby={errors.email ? "email-error" : undefined}
  onChange={(event) => {
    setEmail(event.target.value);
    setErrors((previous) => ({
      ...previous,
      email: "",
      form: "",
    }));
  }}
/>

  {errors.email && (
    <p id="email-error" className="login-field-error">
      {errors.email}
    </p>
  )}
</div>

<div className="form-field">
  <label
  htmlFor="password"
  className={errors.password || errors.form ? "field-error" : ""}
>
  Password
</label>

<input
  id="password"
  type="password"
  placeholder="Password"
  autoComplete="current-password"
  value={password}
  aria-invalid={Boolean(errors.password || errors.form)}
  aria-describedby={errors.password ? "password-error" : undefined}
  onChange={(event) => {
    setPassword(event.target.value);
    setErrors((previous) => ({
      ...previous,
      password: "",
      form: "",
    }));
  }}
/>

  {errors.password && (
    <p id="password-error" className="login-field-error">
      {errors.password}
    </p>
  )}

  <button className="forgot-password" type="button">
    Forgot Password?
  </button>
</div>

          {errors.form && (
  <p className="login-error" role="alert">
    {errors.form}
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

