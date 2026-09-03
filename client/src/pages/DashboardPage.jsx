import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";
import "./DashboardPage.css";

function getRecipeId(recipe) {
  return recipe._id || recipe.id;
}

function DashboardPage() {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const location = useLocation();

const successMessage = location.state?.recipeCreated
  ? "Your recipe was successfully created."
  : "";

  useEffect(() => {
    async function loadRecipes() {
      try {
        const response = await api.get("/api/recipes");
        const payload = response.data;
        const recipeList = Array.isArray(payload)
          ? payload
          : payload.recipes || payload.data || [];

        setRecipes(recipeList);
      } catch {
        setError("Unable to load your recipes.");
      } finally {
        setLoading(false);
      }
    }

    loadRecipes();
  }, []);

  async function handleDelete(recipeId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this recipe?"
    );

    if (!confirmed) return;

    try {
      await api.delete(`/api/recipes/${recipeId}`);
      setRecipes((currentRecipes) =>
        currentRecipes.filter((recipe) => getRecipeId(recipe) !== recipeId)
      );
    } catch (deleteError) {
      setError(
        deleteError.response?.data?.message ||
          "Unable to delete this recipe."
      );
    }
  }

  function handleLogout() {
    sessionStorage.removeItem("token");
    navigate("/login");
  }

  if (loading) {
    return (
      <main className="dashboard-page">
        <p className="dashboard-status">Loading your dashboard...</p>
      </main>
    );
  }

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <Link className="dashboard-brand" to="/">
          <span className="brand-mark" aria-hidden="true">
            S
          </span>
          <span>poonful</span>
        </Link>

        <button className="logout-button" type="button" onClick={handleLogout}>
          Log out
        </button>
      </header>

      <section className="dashboard-content">
        <div className="dashboard-heading">
          <div>
            {successMessage && (
  <div className="success-bubble" role="status">
    {successMessage}
  </div>
)}
            <p>Welcome back! Manage your recipes or add a new one.</p>
            <h1>Your Recipes</h1>
            
          </div>

        </div>

        {error && (
          <p className="dashboard-error" role="alert">
            {error}
          </p>
        )}

        {recipes.length === 0 ? (
          <div>
          <section className="empty-dashboard">
            <p>Your recipes will show up here.</p>
            
          </section>
          
            </div>
        ) : (
          <div className="recipe-card-grid">
  {recipes.map((recipe, index) => {
    const recipeId = recipe._id || recipe.id || index;
    const image = recipe.image;
    const tags = Array.isArray(recipe.tags) ? recipe.tags : [];
    const createdDate = recipe.createdAt || recipe.created_at;

    return (
      <article className="recipe-card" key={recipeId}>
        <Link to={`/recipes/${recipeId}`} className="recipe-card-link">
          {image ? (
            <img
              className="recipe-card-image"
              src={image}
              alt={recipe.title}
            />
          ) : (
            <div className="recipe-card-image recipe-card-no-image">
              No image
            </div>
          )}

          <div className="recipe-card-content">
            <h2>{recipe.title}</h2>

            <p className="recipe-card-date">
              Created on{" "}
              {createdDate
                ? new Date(createdDate).toLocaleDateString()
                : "Date unavailable"}
            </p>

            <div className="recipe-card-tags">
              {tags.map((tag, tagIndex) => (
                <span className="recipe-tag" key={`${tag}-${tagIndex}`}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </Link>
      </article>
    );
  })}
</div>
        )}
        <Link className="add-recipe-button" to="/recipes/new">
  Create Recipe
</Link>
<Link className="browse-recipes-button" to="/recipes">
  Browse Recipes
</Link>
      </section>
    </main>
  );
}

export default DashboardPage;