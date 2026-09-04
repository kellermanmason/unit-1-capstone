import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import "./RecipeCreatePage.css";

function parseIngredients(value) {
  return value
    .split(",")
    .map((ingredient) => ingredient.trim())
    .filter(Boolean)
    .map((ingredient) => {
      const [quantity, name] = ingredient
        .split("|")
        .map((part) => part.trim());

      return quantity && name
        ? { quantity, name }
        : { quantity: "to taste", name: ingredient };
    });
}

function parseInstructions(value) {
  return value
    .split("\n")
    .map((instruction) => instruction.trim())
    .filter(Boolean)
    .map((description, index) => ({
      step: index + 1,
      description,
    }));
}

function parseTags(value) {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function formatIngredients(ingredients) {
  if (typeof ingredients === "string") return ingredients;
  if (!Array.isArray(ingredients)) return "";

  return ingredients
    .map((ingredient) => {
      if (typeof ingredient === "string") return ingredient;

      const quantity = ingredient.quantity || "to taste";
      const name = ingredient.name || "";

      return name ? `${quantity} | ${name}` : "";
    })
    .filter(Boolean)
    .join(", ");
}

function formatInstructions(instructions) {
  if (typeof instructions === "string") return instructions;
  if (!Array.isArray(instructions)) return "";

  return instructions
    .map((instruction) => {
      if (typeof instruction === "string") return instruction;

      return instruction.description || instruction.text || "";
    })
    .filter(Boolean)
    .join("\n");
}

function formatTags(tags) {
  return Array.isArray(tags) ? tags.join(", ") : tags || "";
}

function RecipeCreatePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [form, setForm] = useState({
    title: "",
    image: "",
    ingredients: "",
    instructions: "",
    tags: "",
  });

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingRecipe, setLoadingRecipe] = useState(isEditing);

  const imageInputRef = useRef(null);

  useEffect(() => {
    if (!id) return;

    async function loadRecipe() {
      try {
        const response = await api.get(`/api/recipes/${id}`);
        const recipe = response.data.recipe || response.data;

        setForm({
          title: recipe.title || "",
          image: recipe.image || "",
          ingredients: formatIngredients(recipe.ingredients),
          instructions: formatInstructions(recipe.instructions),
          tags: formatTags(recipe.tags),
        });
      } catch (loadError) {
        setError(
          loadError.response?.data?.message ||
            "Unable to load this recipe.",
        );
      } finally {
        setLoadingRecipe(false);
      }
    }

    loadRecipe();
  }, [id]);

  function handleImageChange(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Please select an image smaller than 2MB.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setForm((currentForm) => ({
        ...currentForm,
        image: reader.result,
      }));

      setError("");
    };

    reader.readAsDataURL(file);
  }

  function handleRemoveImage() {
    setForm((currentForm) => ({
      ...currentForm,
      image: "",
    }));

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  }

  function handleEditImage() {
    imageInputRef.current?.click();
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (
      !form.title.trim() ||
      !form.ingredients.trim() ||
      !form.instructions.trim()
    ) {
      setError("Title, ingredients, and instructions are required.");
      return;
    }

    const recipeData = {
      title: form.title.trim(),
      image: form.image,
      ingredients: parseIngredients(form.ingredients),
      instructions: parseInstructions(form.instructions),
      tags: parseTags(form.tags),
    };

    setSaving(true);

    try {
      if (isEditing) {
        await api.put(`/api/recipes/${id}`, recipeData);
      } else {
        await api.post("/api/recipes", recipeData);
      }

      navigate("/dashboard", {
        state: {
          recipeCreated: !isEditing,
          recipeUpdated: isEditing,
        },
      });
    } catch (saveError) {
      console.error("Recipe save failed:", {
        status: saveError.response?.status,
        data: saveError.response?.data,
        message: saveError.message,
      });

      setError(
        saveError.response?.data?.message ||
          saveError.response?.data?.error ||
          "Unable to save your recipe.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loadingRecipe) {
    return (
      <main className="recipe-create-page">
        <p className="recipe-form-status">Loading recipe...</p>
      </main>
    );
  }

  return (
    <main className="recipe-create-page">
      <header className="recipe-create-header">
        <Link className="recipe-create-brand" to="/dashboard">
          <img
    className="auth-logo"
    src="/spoonful-logo.png"
    alt="Spoonful"
  />
        </Link>
      </header>

      <section className="recipe-create-content">
        <h1>{isEditing ? "Edit Recipe" : "Create a Recipe"}</h1>

        <form className="recipe-form" onSubmit={handleSubmit}>
          <label htmlFor="title">Title</label>
          <input
            id="title"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Recipe title"
            required
          />

          <label htmlFor="ingredients">Ingredients</label>
          <textarea
            id="ingredients"
            name="ingredients"
            value={form.ingredients}
            onChange={handleChange}
            placeholder="1 | Onion, 2 | tomatoes, 3 cloves | garlic"
            rows="3"
            required
          />

          <label htmlFor="instructions">Instructions</label>
          <textarea
            id="instructions"
            name="instructions"
            value={form.instructions}
            onChange={handleChange}
            placeholder={"Chop the vegetables.\nCook until tender."}
            rows="6"
            required
          />

          <label htmlFor="tags">Tags</label>
          <input
            id="tags"
            name="tags"
            value={form.tags}
            onChange={handleChange}
            placeholder="Dinner, healthy, quick"
          />

          <div className="image-section">
            <label className="image-upload-box" htmlFor="image">
              {form.image ? (
                <img
                  className="image-preview"
                  src={form.image}
                  alt="Selected recipe"
                />
              ) : (
                <>
                  
                  <span className="image-title">+ Add Image</span>
                </>
              )}

              <input
                ref={imageInputRef}
                id="image"
                name="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                hidden
              />
            </label>

            {form.image && (
              <div className="image-actions">
                <button
                  className="image-action-button image-delete-button"
                  type="button"
                  onClick={handleRemoveImage}
                  aria-label="Remove image"
                  title="Remove image"
                >
                  🗑
                </button>

                <button
                  className="image-action-button image-edit-button"
                  type="button"
                  onClick={handleEditImage}
                  aria-label="Replace image"
                  title="Replace image"
                >
                  ✎
                </button>
              </div>
            )}
          </div>

          {error && (
            <p className="recipe-form-error" role="alert">
              {error}
            </p>
          )}

          <button
            className="save-recipe-button"
            type="submit"
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : isEditing
                ? "Save Changes"
                : "Save Recipe"}
          </button>

          <Link className="cancel-recipe-button" to="/dashboard">
            Cancel
          </Link>
        </form>
      </section>
    </main>
  );
}

export default RecipeCreatePage;