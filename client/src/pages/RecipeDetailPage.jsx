import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";
import "./RecipeDetailPage.css";

function RecipeDetailPage() {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadRecipe() {
      try {
        const response = await api.get(`/api/recipes/${id}`);
        setRecipe(response.data);
      } catch (loadError) {
        setError(
          loadError.response?.data?.message ||
            "Unable to load this recipe.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadRecipe();
  }, [id]);

  if (loading) {
    return <main className="recipe-detail-page">Loading recipe...</main>;
  }

  if (error || !recipe) {
    return (
      <main className="recipe-detail-page">
        <p className="recipe-detail-error">
          {error || "Recipe not found."}
        </p>
        <Link to="/recipes" className="back-link">
          Back to Recipe List
        </Link>
      </main>
    );
  }

  const ingredients = Array.isArray(recipe.ingredients)
    ? recipe.ingredients
    : [];

  const instructions = Array.isArray(recipe.instructions)
    ? recipe.instructions
    : [];

  const tags = Array.isArray(recipe.tags) ? recipe.tags : [];

  return (
    <main className="recipe-detail-page">
      <header className="recipes-header">
        <Link className="recipes-brand" to="/">
          <img
    className="auth-logo"
    src="/spoonful-logo.png"
    alt="Spoonful"
  />
        </Link>

        <Link className="recipes-login-link" to="/login">
          Log In
        </Link>
      </header>
      
        <Link to="/recipes" className="back-link">
          ← Recipe List
        </Link>

        

      <article className="recipe-detail-card">
        {recipe.image && (
          <img
            className="recipe-detail-image"
            src={recipe.image}
            alt={recipe.title}
          />
        )}

        <div className="recipe-detail-content">
          <h1>{recipe.title}</h1>

          

          <section className="recipe-detail-section">
            <h2>Ingredients</h2>

            {ingredients.length > 0 ? (
              <ul className="ingredient-list">
                {ingredients.map((ingredient, index) => {
                  const quantity =
                    typeof ingredient === "object"
                      ? ingredient.quantity
                      : "";

                  const name =
                    typeof ingredient === "object"
                      ? ingredient.name
                      : ingredient;

                  return (
                    <li key={`${name}-${index}`}>
                      {quantity ? `${quantity} ` : ""}
                      {name}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p>No ingredients listed.</p>
            )}
          </section>

          <section className="recipe-detail-section">
  <h2>Instructions</h2>

  {instructions.length > 0 ? (
    <p className="instruction-paragraph">
      {instructions
        .map((instruction) =>
          typeof instruction === "object"
            ? instruction.text ||
              instruction.description ||
              instruction.step
            : instruction,
        )
        .filter(Boolean)
        .join(" ")}
    </p>
  ) : (
    <p>No instructions listed.</p>
  )}
</section>

{tags.length > 0 && (
  <div className="recipe-detail-tags">
    {tags.map((tag, index) => (
      <span className="recipe-detail-tag" key={`${tag}-${index}`}>
        {tag}
      </span>
    ))}
  </div>
)}
        </div>
      </article>
    </main>
  );
}

export default RecipeDetailPage