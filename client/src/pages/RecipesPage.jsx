import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "./RecipesPage.css";

function RecipesPage() {
  const [recipes, setRecipes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadRecipes() {
      try {
        const response = await api.get("/api/recipes/public");
        const loadedRecipes = Array.isArray(response.data)
          ? response.data
          : response.data.recipes || [];

        setRecipes(loadedRecipes);
      } catch (loadError) {
        setError(
          loadError.response?.data?.message ||
            "Unable to load recipes."
        );
      } finally {
        setLoading(false);
      }
    }

    loadRecipes();
  }, []);

  const filteredRecipes = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) return recipes;

    return recipes.filter((recipe) =>
      recipe.title?.toLowerCase().includes(query)
    );
  }, [recipes, searchTerm]);

  return (
    <main className="recipes-page">
      <header className="recipes-header">
        <Link className="recipes-brand" to="/">
          <span className="brand-mark" aria-hidden="true">
            S
          </span>
          <span>poonful</span>
        </Link>

        <Link className="recipes-login-link" to="/login">
          Log In
        </Link>
      </header>

      <section className="recipes-content">
        <h1>Recipe List</h1>

        <input
          className="recipe-search"
          type="search"
          placeholder="Search recipe titles..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          aria-label="Search recipe titles"
        />

        {loading && <p className="recipes-message">Loading recipes...</p>}

        {error && (
          <p className="recipes-error" role="alert">
            {error}
          </p>
        )}

        {!loading && !error && filteredRecipes.length === 0 && (
          <p className="recipes-message">
            {searchTerm
              ? "We couldn't find any recipes."
              : "We couldn't find any recipes."}
          </p>
        )}

        {!loading && !error && filteredRecipes.length > 0 && (
          <div className="public-recipe-grid">
            {filteredRecipes.map((recipe, index) => {
              const recipeId = recipe._id || recipe.id || index;
              const tags = Array.isArray(recipe.tags) ? recipe.tags : [];
              const createdDate = recipe.createdAt || recipe.created_at;

              return (
                <article className="public-recipe-card" key={recipeId}>
                  <Link to={`/recipes/${recipeId}`}>
                    {recipe.image ? (
                      <img
                        className="public-recipe-image"
                        src={recipe.image}
                        alt={recipe.title}
                      />
                    ) : (
                      <div className="public-recipe-image no-recipe-image">
                        No image
                      </div>
                    )}

                    <div className="public-recipe-details">
                      <h2>{recipe.title}</h2>

                      <p className="public-recipe-date">
                        Created on{" "}
                        {createdDate
                          ? new Date(createdDate).toLocaleDateString()
                          : "Date unavailable"}
                      </p>

                      <div className="public-recipe-tags">
                        {tags.map((tag, tagIndex) => (
                          <span
                            className="public-recipe-tag"
                            key={`${tag}-${tagIndex}`}
                          >
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
      </section>
    </main>
  );
}

export default RecipesPage;