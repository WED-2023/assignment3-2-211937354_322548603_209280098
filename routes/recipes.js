const express = require("express");
const router = express.Router();
const recipesLogic = require("../routes/utils/recipes_utils");
const verifyLogin = require("./middleware/verifyLogin");


// Secure the routes that require login
router.use(verifyLogin);


/** User Personal's Recipes **/

router.post("/user/new-recipe", async (req, res, next) => {
  try {
    await recipesLogic.addPersonalRecipe(req.user_id, req.body);
    res.status(201).send({ message: "Recipe created successfully!" });
  } catch (error) {
    console.error("Error adding personal recipe:", error);
    next(error);
  }
});

router.get("/user/my-recipes", async (req, res, next) => {
  try {
    const recipes = await recipesLogic.getAllUserRecipes(req.user_id);
    res.status(200).send(recipes);
  } catch (error) {
    console.error("Error fetching user's personal recipes:", error);
    next(error);
  }
});

router.delete("/user/my-recipes/:recipeId", async (req, res, next) => {
  try {
    await recipesLogic.deletePersonalRecipe(req.params.recipeId);
    res.status(200).send({ message: "Recipe deleted successfully ✅" });
  } catch (error) {
    console.error("Error deleting personal recipe:", error);
    next(error);
  }
});

router.put("/user/my-recipes/:recipeId", async (req, res, next) => {
  try {
    await recipesLogic.updateUserRecipeDetails(req.params.recipeId, req.body);
    res.status(200).send({ message: "Recipe updated successfully ✅" });
  } catch (error) {
    console.error("Error updating personal recipe:", error);
    next(error);
  }
});

/** Recipe's Ingredients **/


router.post("/user/my-recipes/:recipeId/ingredients", async (req, res, next) => {
  try {
    const { ingredientName, amount, unit } = req.body;
    await recipesLogic.addIngredientToUserRecipe(
        req.params.recipeId,
        ingredientName,
        amount,
        unit
    );
    res.status(201).send({ message: "Ingredient added successfully" });
  } catch (error) {
    console.error("Error adding ingredient:", error);
    next(error);
  }
});

router.get("/user/my-recipes/:recipeId/ingredients", async (req, res, next) => {
  try {
    const ingredients = await recipesLogic.getIngredientsByRecipeId(req.params.recipeId);
    res.status(200).send(ingredients);
  } catch (error) {
    console.error("Error fetching ingredients:", error);
    next(error);
  }
});

router.put("/user/my-recipes/ingredients/:ingredientId", async (req, res, next) => {
  try {
    const { ingredientId } = req.params;
    const updatedFields = req.body;

    await recipesLogic.updateIngredient(ingredientId, updatedFields);
    res.status(200).send({ message: "Ingredient updated successfully ✅" });
  } catch (error) {
    console.error("Error updating ingredient:", error);
    next(error);
  }
});

router.delete("/user/my-recipes/ingredients/:ingredientId", async (req, res, next) => {
  try {
    const { ingredientId } = req.params;
    await recipesLogic.deleteIngredient(ingredientId);
    res.status(200).send({ message: "Ingredient deleted successfully ✅" });
  } catch (error) {
    console.error("Error deleting ingredient:", error);
    next(error);
  }
});

/** Family's Recipes **/

router.post("/user/family-recipes", async (req, res, next) => {
  try {
    await recipesLogic.addFamilyRecipe(req.user_id, req.body);
    res.status(201).send({ message: "Family recipe created successfully 👨‍👩‍👧‍👦" });
  } catch (error) {
    console.error("Error creating family recipe:", error);
    next(error);
  }
});

router.get("/family", async (req, res, next) => {
  try {
    const recipes = await recipesLogic.getAllFamilyRecipes();
    res.status(200).send(recipes);
  } catch (error) {
    console.error("Error fetching family recipes:", error);
    next(error);
  }
});

router.get("/family/:recipeId", async (req, res, next) => {
  try {
    const recipe = await recipesLogic.getFamilyRecipeById(req.params.recipeId);
    if (!recipe) return res.status(404).send({ message: "Recipe not found" });
    res.status(200).send(recipe);
  } catch (error) {
    console.error("Error fetching family recipe:", error);
    next(error);
  }
});

router.get("/user/my-family-recipes", async (req, res, next) => {
  try {
    const recipes = await recipesLogic.getFamilyRecipesByUserId(req.user_id);
    res.status(200).send(recipes);
  } catch (error) {
    console.error("Error fetching user's family recipes:", error);
    next(error);
  }
});

router.put("/user/my-family-recipes/:recipeId", async (req, res, next) => {
  try {
    await recipesLogic.updateFamilyRecipe(req.params.recipeId, req.body);
    res.status(200).send({ message: "Family recipe updated successfully 🛠️" });
  } catch (error) {
    console.error("Error updating family recipe:", error);
    next(error);
  }
});

router.delete("/user/my-family-recipes/:recipeId", async (req, res, next) => {
  try {
    await recipesLogic.deleteFamilyRecipe(req.params.recipeId);
    res.status(200).send({ message: "Family recipe deleted successfully 🗑️" });
  } catch (error) {
    console.error("Error deleting family recipe:", error);
    next(error);
  }
});


/** Family's Recipes Ingredients **/


router.post("/user/my-family-recipes/:recipeId/ingredients", async (req, res, next) => {
  try {
    const { ingredientName, amount, unit } = req.body;
    await recipesLogic.addIngredientToFamilyRecipe(
        req.params.recipeId,
        ingredientName,
        amount,
        unit
    );
    res.status(201).send({ message: "Ingredient added successfully 🧂" });
  } catch (error) {
    console.error("Error adding ingredient to family recipe:", error);
    next(error);
  }
});


router.get("/user/my-family-recipes/:recipeId/ingredients", async (req, res, next) => {
  try {
    const ingredients = await recipesLogic.getIngredientsByFamilyRecipeId(req.params.recipeId);
    res.status(200).send(ingredients);
  } catch (error) {
    console.error("Error fetching ingredients for family recipe:", error);
    next(error);
  }
});

router.put("/user/my-family-recipes/ingredients/:ingredientId", async (req, res, next) => {
  try {
    const { ingredientName, amount, unit } = req.body;
    await recipesLogic.updateFamilyIngredientById(req.params.ingredientId, ingredientName, amount, unit);
    res.status(200).send({ message: "Family recipe ingredient updated successfully 🛠️" });
  } catch (error) {
    console.error("Error updating family recipe ingredient:", error);
    next(error);
  }
});


router.delete("/user/my-family-recipes/ingredients/:ingredientId", async (req, res, next) => {
  try {
    await recipesLogic.deleteFamilyIngredient(req.params.ingredientId);
    res.status(200).send({ message: "Family recipe ingredient deleted successfully 🗑️" });
  } catch (error) {
    console.error("Error deleting family recipe ingredient:", error);
    next(error);
  }
});

/** recipe_preparation_steps **/
router.post("/steps", async (req, res, next) => {
  try {
    const { userRecipeId = null, familyRecipeId = null, stepNumber, stepDescription } = req.body;

    await recipesLogic.addPreparationStepToRecipe(userRecipeId, familyRecipeId, stepNumber, stepDescription);
    res.status(201).send({ message: "Step added successfully ✅" });
  } catch (error) {
    console.error("Error adding step:", error);
    next(error);
  }
});

router.get("/steps", async (req, res, next) => {
  try {
    const { userRecipeId = null, familyRecipeId = null } = req.query;

    if (!userRecipeId && !familyRecipeId) {
      return res.status(400).send({ message: "Recipe ID is required." });
    }

    const steps = await recipesLogic.getPreparationSteps(userRecipeId, familyRecipeId);
    res.status(200).send(steps);
  } catch (error) {
    console.error("Error fetching preparation steps:", error);
    next(error);
  }
});


router.put("/steps/:stepId", async (req, res, next) => {
  try {
    const { stepId } = req.params;
    const { newDescription } = req.body;

    if (!newDescription) {
      return res.status(400).send({ message: "New description is required." });
    }

    await recipesLogic.updatePreparationStep(stepId, newDescription);
    res.status(200).send({ message: "Step updated successfully ✅" });
  } catch (error) {
    console.error("Error updating step description:", error);
    next(error);
  }
});


router.delete("/steps/:stepId", async (req, res, next) => {
  try {
    const { stepId } = req.params;
    await recipesLogic.deletePreparationStep(stepId);
    res.status(200).send({ message: "Step deleted successfully 🗑️" });
  } catch (error) {
    console.error("Error deleting preparation step:", error);
    next(error);
  }
});

router.delete("/steps", async (req, res, next) => {
  try {
    const { userRecipeId = null, familyRecipeId = null } = req.body;

    if (!userRecipeId && !familyRecipeId) {
      return res.status(400).send({ message: "Must provide either userRecipeId or familyRecipeId." });
    }

    await recipesLogic.deleteAllStepsForRecipe(userRecipeId, familyRecipeId);
    res.status(200).send({ message: "All steps deleted successfully 🚮" });
  } catch (error) {
    console.error("Error deleting all steps:", error);
    next(error);
  }
});


/** recipe_preparation_progress **/

router.post("/steps/progress", async (req, res, next) => {
  try {
    const { spoonacularId = null, userRecipeId = null, familyRecipeId = null, stepNumber } = req.body;

    await recipesLogic.addPreparationStepProgress(
        req.user_id,
        spoonacularId,
        userRecipeId,
        familyRecipeId,
        stepNumber
    );

    res.status(201).send({ message: "Progress step added successfully ✅" });
  } catch (error) {
    console.error("Error adding progress step:", error);
    next(error);
  }
});


router.put("/steps/progress/complete", async (req, res, next) => {
  try {
    const { spoonacularId = null, userRecipeId = null, familyRecipeId = null, stepNumber } = req.body;

    await recipesLogic.completePreparationStep(
        req.user_id,
        spoonacularId,
        userRecipeId,
        familyRecipeId,
        stepNumber
    );

    res.status(200).send({ message: "Step marked as completed ✅" });
  } catch (error) {
    console.error("Error completing step:", error);
    next(error);
  }
});


router.put("/steps/progress/uncomplete", async (req, res, next) => {
  try {
    const { spoonacularId = null, userRecipeId = null, familyRecipeId = null, stepNumber } = req.body;

    await recipesLogic.uncompletePreparationStep(
        req.user_id,
        spoonacularId,
        userRecipeId,
        familyRecipeId,
        stepNumber
    );

    res.status(200).send({ message: "Step marked as uncompleted 🔄" });
  } catch (error) {
    console.error("Error uncompleting step:", error);
    next(error);
  }
});


router.get("/steps/progress", async (req, res, next) => {
  try {
    const { spoonacularId = null, userRecipeId = null, familyRecipeId = null } = req.query;

    const progress = await recipesLogic.getRecipeProgress(
        req.user_id,
        spoonacularId,
        userRecipeId,
        familyRecipeId
    );

    res.status(200).send(progress);
  } catch (error) {
    console.error("Error retrieving preparation progress:", error);
    next(error);
  }
});


/** Reset preparation progress (for restarting a recipe session) */
router.delete("/steps/progress", async (req, res, next) => {
  try {
    const { spoonacularId = null, userRecipeId = null, familyRecipeId = null } = req.query;

    await recipesLogic.resetRecipeProgress(
        req.user_id,
        spoonacularId,
        userRecipeId,
        familyRecipeId
    );

    res.status(200).send({ message: "Preparation progress reset successfully 🔄" });
  } catch (error) {
    console.error("Error resetting preparation progress:", error);
    next(error);
  }
});



 module.exports = router;
