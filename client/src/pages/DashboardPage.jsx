import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";
import "./DashboardPage.css";

function getRecipeId(recipe) {
  return recipe._id || recipe.id;
}

function DashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [recipeToDelete, setRecipeToDelete] = useState(null);

  const successMessage = location.state?.recipeCreated
    ? "Your recipe was successfully created."
    : location.state?.recipeUpdated
      ? "Your recipe was successfully updated."
      : "";

  function openDeleteDialog(event, recipe) {
  event.preventDefault();
  setRecipeToDelete(recipe);
}

  useEffect(() => {
    async function loadRecipes() {
      try {
        const response = await api.get("/api/recipes");
        const payload = response.data;

        const recipeList = Array.isArray(payload)
          ? payload
          : payload.recipes || payload.data || [];

        setRecipes(recipeList);
      } catch (loadError) {
        setError(
          loadError.response?.data?.message ||
            "Unable to load your recipes.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadRecipes();
  }, []);

  async function handleDeleteRecipe() {
    if (!recipeToDelete) return;

    const recipeId = getRecipeId(recipeToDelete);

    try {
      await api.delete(`/api/recipes/${recipeId}`);

      setRecipes((currentRecipes) =>
        currentRecipes.filter(
          (recipe) => getRecipeId(recipe) !== recipeId,
        ),
      );

      setRecipeToDelete(null);
    } catch (deleteError) {
      setError(
        deleteError.response?.data?.message ||
          "Unable to delete this recipe.",
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
          <section className="empty-dashboard">
            <p>Your recipes will show up here.</p>
          </section>
        ) : (
          <div className="recipe-card-grid">
            {recipes.map((recipe, index) => {
              const recipeId = getRecipeId(recipe) || index;
              const tags = Array.isArray(recipe.tags) ? recipe.tags : [];
              const createdDate =
                recipe.createdAt || recipe.created_at;

              return (
                <article className="recipe-card" key={recipeId}>
                  <Link
                    to={`/recipes/${recipeId}`}
                    className="recipe-card-link"
                  >
                    {recipe.image ? (
                      <img
                        className="recipe-card-image"
                        src={recipe.image}
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
                          <span
                            className="recipe-tag"
                            key={`${tag}-${tagIndex}`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Link>

                  <div className="recipe-card-actions">
  <Link
    className="recipe-action-button"
    to={`/recipes/${recipeId}/edit`}
    aria-label={`Edit ${recipe.title}`}
    title="Edit recipe"
  >
    ✎
  </Link>

  <a
    className="recipe-action-button delete-action"
    href={`#delete-${recipeId}`}
    aria-label={`Delete ${recipe.title}`}
    title="Delete recipe"
    onClick={(event) => openDeleteDialog(event, recipe)}
  >
    🗑
  </a>
</div>
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

      {recipeToDelete && (
        <div className="delete-modal-backdrop">
          <section
            className="delete-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-recipe-title"
          >
            <h2 id="delete-recipe-title">Delete recipe?</h2>

            <div className="delete-modal-actions">
              <button
                className="confirm-delete-button"
                type="button"
                onClick={handleDeleteRecipe}
              >
                Yes, Delete Recipe
              </button>

              <button
                className="cancel-delete-button"
                type="button"
                onClick={() => setRecipeToDelete(null)}
              >
                Nevermind
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

export default DashboardPage;