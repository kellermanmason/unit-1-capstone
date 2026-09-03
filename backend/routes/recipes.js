const express = require("express");
const router = express.Router();
const recipesCtrl = require("../controllers/recipes");
const verifyToken = require("../middleware/verifyToken");

router.get("/public", recipesCtrl.getAll);
router.get("/", verifyToken, recipesCtrl.getMine);
router.get("/:id", recipesCtrl.getOne);
router.post("/", verifyToken, recipesCtrl.create);
router.put("/:id", verifyToken, recipesCtrl.update);
router.delete("/:id", verifyToken, recipesCtrl.delete);

module.exports = router;