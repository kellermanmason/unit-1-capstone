const Recipe = require("../models/recipe");

module.exports = {
  create,
  getAll,
  getMine,
  getOne,
  update,
  delete: deleteOne,
  addInstruction,
  updateInstruction,
  deleteInstruction,
};

function getUserId(req) {
  return req.user?._id || req.user?.id;
}

function isOwner(recipe, req) {
  const userId = getUserId(req);

  return (
    recipe?.ownerId &&
    userId &&
    recipe.ownerId.toString() === userId.toString()
  );
}

async function getMine(req, res) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated." });
    }

    const recipes = await Recipe.find({
      ownerId: userId,
    }).sort({ createdAt: -1 });

    res.json(recipes);
  } catch (error) {
    console.error("Unable to load user recipes:", error);
    res.status(500).json({
      message: "Unable to load your recipes.",
    });
  }
}

async function create(req, res) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated." });
    }

    const recipe = await Recipe.create({
      ...req.body,
      ownerId: userId,
    });

    res.status(201).json(recipe);
  } catch (error) {
    console.error("Recipe creation failed:", error);
    res.status(400).json({
      message: error.message,
    });
  }
}

async function getAll(req, res) {
  try {
    const { title, tag, ingredient } = req.query;
    const query = {};

    if (title) {
      query.title = { $regex: title, $options: "i" };
    }

    if (tag) {
      query.tags = tag;
    }

    if (ingredient) {
      query["ingredients.name"] = ingredient;
    }

    const recipes = await Recipe.find(query).sort({ createdAt: -1 });

    res.json(recipes);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

async function getOne(req, res) {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({
        message: "Cannot find recipe.",
      });
    }

    res.json(recipe);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

async function update(req, res) {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({
        message: "Cannot find recipe.",
      });
    }

    if (!isOwner(recipe, req)) {
      return res.status(403).json({
        message: "Unauthorized.",
      });
    }

    const updates = { ...req.body };
    delete updates.ownerId;

    const updatedRecipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      updates,
      {
        new: true,
        runValidators: true,
      },
    );

    res.json(updatedRecipe);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
}

async function deleteOne(req, res) {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({
        message: "Cannot find recipe.",
      });
    }

    if (!isOwner(recipe, req)) {
      return res.status(403).json({
        message: "Unauthorized.",
      });
    }

    await Recipe.findByIdAndDelete(req.params.id);

    res.json({
      message: "Deleted Recipe",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

async function addInstruction(req, res) {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({
        message: "Cannot find recipe.",
      });
    }

    if (!isOwner(recipe, req)) {
      return res.status(403).json({
        message: "Unauthorized.",
      });
    }

    recipe.instructions.push(req.body);
    await recipe.save();

    res.status(201).json(recipe);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
}

async function updateInstruction(req, res) {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({
        message: "Cannot find recipe.",
      });
    }

    if (!isOwner(recipe, req)) {
      return res.status(403).json({
        message: "Unauthorized.",
      });
    }

    const instruction = recipe.instructions.id(req.params.instructionId);

    if (!instruction) {
      return res.status(404).json({
        message: "Cannot find instruction.",
      });
    }

    instruction.set(req.body);
    await recipe.save();

    res.json(recipe);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
}

async function deleteInstruction(req, res) {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({
        message: "Cannot find recipe.",
      });
    }

    if (!isOwner(recipe, req)) {
      return res.status(403).json({
        message: "Unauthorized.",
      });
    }

    const instruction = recipe.instructions.id(req.params.instructionId);

    if (!instruction) {
      return res.status(404).json({
        message: "Cannot find instruction.",
      });
    }

    recipe.instructions.pull(req.params.instructionId);
    await recipe.save();

    res.json({
      message: "Deleted Instruction",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}