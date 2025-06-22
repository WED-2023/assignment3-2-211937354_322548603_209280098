const express = require("express");
const router = express.Router();
const recipesLogic = require("../routes/utils/recipes_utils");
const verifyLogin = require("./middleware/verifyLogin");


// Secure the routes that require login
router.use(verifyLogin);


/** User Personal's Recipes **/
// 🔽 Example of the JSON payload this route expects in the request body:
/*
{
  "title": "Shakshuka Deluxe",
  "imageUrl": "https://www.agaliving.com/sites/default/files/styles/recipe_image/public/2023-05/Shakshuka%20in%20Saute%20pan.jpg.webp?itok=BCSlAmt6",
  "readyInMinutes": 30,
  "isVegan": false,
  "isVegetarian": true,
  "isGlutenFree": true,
  "servings": 2,
  "summary": "A delicious spicy tomato and egg dish.",
  "instructions": "Heat pan, add sauce, crack eggs, cook until ready.",
  "ingredients": [
    { "ingredientName": "Eggs", "amount": 3, "unit": "pcs" },
    { "ingredientName": "Tomato Sauce", "amount": 200, "unit": "ml" }
  ],
  "preparationSteps": [
    { "stepNumber": 1, "stepDescription": "Heat the pan with a bit of oil." },
    { "stepNumber": 2, "stepDescription": "Add the tomato sauce and simmer for 5 minutes." },
    { "stepNumber": 3, "stepDescription": "Crack eggs on top and cover the pan." }
  ]
}

*/


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

router.get("/user/my-recipes/:recipeId", async (req, res, next) => {
  try {
    const recipe = await recipesLogic.getUserRecipeById(req.params.recipeId, req.user_id);
    res.status(200).send(recipe);
  } catch (error) {
    console.error("Error fetching personal recipe by ID:", error);
    next(error);
  }
});


router.delete("/user/my-recipes/:recipeId", async (req, res, next) => {
  try {
    await recipesLogic.deletePersonalRecipe(req.params.recipeId, req.user_id);
    res.status(200).send({ message: "Recipe deleted successfully ✅" });
  } catch (error) {
    console.error("Error deleting personal recipe:", error);
    next(error);
  }
});

// 🔽 Example of the JSON payload this route expects in the request body:
// Only include fields you want to change; all are optional.
/*
example 1:
{
  "title": "Shakshuka Supreme",
  "image_url": "https://www.agaliving.com/sites/default/files/styles/recipe_image/public/2023-05/Shakshuka%20in%20Saute%20pan.jpg.webp?itok=BCSlAmt6",
  "ready_in_minutes": 25,
  "is_vegan": false,
  "is_vegetarian": true,
  "is_gluten_free": true,
  "servings": 3,
  "summary": "A spicy tomato-based breakfast.",
  "instructions": "Simmer sauce, crack eggs, cover and serve."
}

example2 :
{
  "summary": "Improved description only",
  "servings": 4
}
 */
router.put("/user/my-recipes/:recipeId", async (req, res, next) => {
  try {
    await recipesLogic.updateUserRecipeDetails(req.params.recipeId, req.body, req.user_id);
    res.status(200).send({ message: "Recipe updated successfully ✅" });
  } catch (error) {
    console.error("Error updating personal recipe:", error);
    next(error);
  }
});

/** User Recipe's Ingredients **/


router.post("/user/my-recipes/:recipeId/ingredients", async (req, res, next) => {
  try {
    const { ingredientName, amount, unit } = req.body;
    await recipesLogic.addIngredientToUserRecipe(
        req.params.recipeId,
        ingredientName,
        amount,
        unit,
        req.user_id
    );
    res.status(201).send({ message: "Ingredient added successfully" });
  } catch (error) {
    console.error("Error adding ingredient:", error);
    next(error);
  }
});


router.get("/user/my-recipes/:recipeId/ingredients", async (req, res, next) => {
  try {
    const ingredients = await recipesLogic.getIngredientsByRecipeId(
        req.params.recipeId,
        req.user_id
    );
    res.status(200).send(ingredients);
  } catch (error) {
    console.error("Error fetching ingredients:", error);
    next(error);
  }
});

// 🔽 Example of the JSON payload this route expects in the request body:
// Only include fields you want to change; all are optional.
/*
example 1:
{
  "ingredient_name": "Chopped Tomatoes",
  "amount": 150,
  "unit": "grams"
}

example 2:
{ "amount": 2.5 }
*/

router.put("/user/my-recipes/:recipeId/ingredients/:ingredientId", async (req, res, next) => {
  try {
    const { recipeId, ingredientId } = req.params;
    const updatedFields = req.body;

    await recipesLogic.updateIngredient(recipeId, ingredientId, updatedFields, req.user_id);
    res.status(200).send({ message: "Ingredient updated successfully ✅" });
  } catch (error) {
    console.error("Error updating ingredient:", error);
    next(error);
  }
});



router.delete("/user/my-recipes/:recipeId/ingredients/:ingredientId", async (req, res, next) => {
  try {
    const { recipeId, ingredientId } = req.params;
    await recipesLogic.deleteIngredient(recipeId, ingredientId, req.user_id);
    res.status(200).send({ message: "Ingredient deleted successfully ✅" });
  } catch (error) {
    console.error("Error deleting ingredient:", error);
    next(error);
  }
});


/** Family's Recipes **/
// 🔽 Example of JSON payload expected when creating a family recipe:
/*
{
  "title": "Grandma's Apple Pie",
  "ownerName": "Grandma Esther",
  "whenToPrepare": "Holidays",
  "imageUrl": "https://www.cubesnjuliennes.com/wp-content/uploads/2020/11/Apple-Pie.jpg",
  "readyInMinutes": 90,
  "servings": 8,
  "instructions": "Preheat oven to 180C...",
  "ingredients": [
    { "ingredientName": "Apples", "amount": 6, "unit": "pieces" },
    { "ingredientName": "Sugar", "amount": 1, "unit": "cup" },
    { "ingredientName": "Flour", "amount": 2, "unit": "cups" }
  ],
  "preparationSteps": [
    { "stepNumber": 1, "stepDescription": "Peel and slice apples" },
    { "stepNumber": 2, "stepDescription": "Mix apples with sugar and flour" },
    { "stepNumber": 3, "stepDescription": "Pour into crust and bake" }
  ]
}
*/


router.post("/user/family-recipes", async (req, res, next) => {
  try {
    await recipesLogic.addFamilyRecipe(req.user_id, req.body);
    res.status(201).send({ message: "Family recipe created successfully 👨‍👩‍👧‍👦" });
  } catch (error) {
    console.error("Error creating family recipe:", error);
    next(error);
  }
});

router.get("/user/my-family-recipes", async (req, res, next) => {
  try {
    const recipes = await recipesLogic.getAllFamilyRecipes(req.user_id);
    res.status(200).send(recipes);
  } catch (error) {
    console.error("Error fetching family recipes:", error);
    next(error);
  }
});


router.get("/user/my-family-recipes/:recipeId", async (req, res, next) => {
  try {
    const recipe = await recipesLogic.getFamilyRecipeById(req.params.recipeId, req.user_id);
    if (!recipe) return res.status(404).send({ message: "Recipe not found" });
    res.status(200).send(recipe);
  } catch (error) {
    console.error("Error fetching family recipe:", error);
    next(error);
  }
});



// 🔽 Example JSON payloads for partial or full family recipe update:
/*
example 1 – full update:
{
  "title": "Holiday Apple Pie",
  "owner_name": "Grandma Esther",
  "when_to_prepare": "Thanksgiving",
  "image_url": "https://images.com/pie.jpg",
  "ready_in_minutes": 95,
  "servings": 10,
  "instructions": "Preheat oven, fill crust, bake until golden."
}

example 2 – partial update:
{
  "image_url": "https://www.cubesnjuliennes.com/wp-content/uploads/2020/11/Apple-Pie.jpg",
  "servings": 6
}
*/

router.put("/user/my-family-recipes/:recipeId", async (req, res, next) => {
  try {
    await recipesLogic.updateFamilyRecipe(req.params.recipeId, req.body, req.user_id);
    res.status(200).send({ message: "Family recipe updated successfully 🛠️" });
  } catch (error) {
    console.error("Error updating family recipe:", error);
    next(error);
  }
});



router.delete("/user/my-family-recipes/:recipeId", async (req, res, next) => {
  try {
    await recipesLogic.deleteFamilyRecipe(req.params.recipeId, req.user_id);
    res.status(200).send({ message: "Family recipe deleted successfully 🗑️" });
  } catch (error) {
    console.error("Error deleting family recipe:", error);
    next(error);
  }
});



/** Family's Recipes Ingredients **/



/**
 * example for JSON Body
 * {
 *   "ingredientName": "Cinnamon",
 *   "amount": 1,
 *   "unit": "tsp"
 * }
 * **/
router.post("/user/my-family-recipes/:recipeId/ingredients", async (req, res, next) => {
  try {
    const { ingredientName, amount, unit } = req.body;
    const { recipeId } = req.params;

    await recipesLogic.addIngredientToFamilyRecipe(
        req.user_id, recipeId, ingredientName, amount, unit
    );
    res.status(201).send({ message: "Ingredient added successfully 🧂" });
  } catch (error) {
    console.error("Error adding ingredient to family recipe:", error);
    next(error);
  }
});



router.get("/user/my-family-recipes/:recipeId/ingredients", async (req, res, next) => {
  try {
    const ingredients = await recipesLogic.getIngredientsByFamilyRecipeId(req.params.recipeId, req.user_id);
    res.status(200).send(ingredients);
  } catch (error) {
    console.error("Error fetching ingredients for family recipe:", error);
    next(error);
  }
});
// 🔽 Example JSON payloads for updating a family recipe ingredient:
/*
example 1 – full update:
{
  "ingredientName": "Brown Sugar",
  "amount": 0.75,
  "unit": "cups"
}

example 2 – partial update:
{
  "amount": 2.5
}
*/
// Only non-empty fields will be updated. At least one field must be present.

router.put("/user/my-family-recipes/:recipeId/ingredients/:ingredientId", async (req, res, next) => {
  try {
    const { ingredientName, amount, unit } = req.body;
    await recipesLogic.updateFamilyIngredientById(
        parseInt(req.params.recipeId),
        parseInt(req.params.ingredientId),
        ingredientName,
        amount,
        unit,
        req.user_id
    );
    res.status(200).send({ message: "Ingredient updated successfully ✅" });
  } catch (error) {
    console.error("Error updating family recipe ingredient:", error);
    next(error);
  }
});





router.delete("/user/my-family-recipes/:recipeId/ingredients/:ingredientId", async (req, res, next) => {
  try {
    const recipeId = parseInt(req.params.recipeId);
    const ingredientId = parseInt(req.params.ingredientId);

    await recipesLogic.deleteFamilyIngredient(ingredientId, recipeId, req.user_id);
    res.status(200).send({ message: "Family recipe ingredient deleted successfully 🗑️" });
  } catch (error) {
    console.error("Error deleting family recipe ingredient:", error);
    next(error);
  }
});

/** recipe_preparation_steps **/


// 🔽 This route handles preparation steps for user, family, or spoonacular recipes.
// The `:type` parameter must be one of: 'my-recipes', 'my-family-recipes', 'spoonacular'
//
// Examples:
//   GET    /user/my-recipes/42/steps
//   GET    /user/my-family-recipes/87/steps
//   GET    /user/spoonacular/12345/steps

router.get("/user/:type/:recipeId/steps", async (req, res, next) => {
  try {
    const { type, recipeId } = req.params;
    const steps = await recipesLogic.getPreparationSteps(type, parseInt(recipeId), req.user_id);
    res.status(200).send(steps);
  } catch (error) {
    console.error("Error fetching preparation steps:", error);
    next(error);
  }
});




// 🔽 This route handles adding preparation steps for both user and family recipes.
// The `:type` parameter must be either 'my-recipes' or 'my-family-recipes'.
//
// Examples:
//   POST /user/my-recipes/42/steps           → adds a step to personal recipe 42
//   POST /user/my-family-recipes/87/steps    → adds a step to family recipe 87

router.post("/user/:type/:recipeId/steps", async (req, res, next) => {
  try {
    const { type, recipeId } = req.params;
    const { stepNumber, stepDescription } = req.body;

    await recipesLogic.addPreparationStepToRecipe(
        type,
        parseInt(recipeId),
        stepNumber,
        stepDescription,
        req.user_id
    );

    res.status(201).send({ message: "Step added successfully ✅" });
  } catch (error) {
    console.error("Error adding preparation step:", error);
    next(error);
  }
});




// 🔽 Updates the description of a preparation step by ID.
// This route supports both personal and family recipes via the `:type` parameter.
// `:type` must be either 'my-recipes' or 'my-family-recipes'.
//
// Examples:
//   PUT /user/my-recipes/steps/13           → updates step 13 from a personal recipe
//   PUT /user/my-family-recipes/steps/42    → updates step 42 from a family recipe
//
// Only the `step_description` can be updated. Changing step_number is not allowed.

router.put("/user/:type/steps/:stepId", async (req, res, next) => {
  try {
    const { type, stepId } = req.params;
    const { newDescription } = req.body;

    // Validate type
    if (!["my-recipes", "my-family-recipes"].includes(type)) {
      return res.status(400).send({ message: "Invalid recipe type. Must be 'my-recipes' or 'my-family-recipes'." });
    }

    if (!newDescription) {
      return res.status(400).send({ message: "New description is required." });
    }

    await recipesLogic.updatePreparationStep(type, parseInt(stepId), newDescription, req.user_id);
    res.status(200).send({ message: "Step updated successfully ✅" });
  } catch (error) {
    console.error("Error updating step description:", error);
    next(error);
  }
});


// 🔽 Deletes a preparation step by its ID for both user and family recipes.
// Requires `:type` to distinguish recipe type: either 'my-recipes' or 'my-family-recipes'.
//
// Examples:
//   DELETE /user/my-recipes/steps/12
//   DELETE /user/my-family-recipes/steps/48
//
// A recipe must retain at least one step after deletion.
// Remaining steps are renumbered to preserve sequence (step_number).
router.delete("/user/:type/steps/:stepId", async (req, res, next) => {
  try {
    const { type, stepId } = req.params;
    await recipesLogic.deletePreparationStep(type, parseInt(stepId), req.user_id);
    res.status(200).send({ message: "Step deleted successfully 🗑️" });
  } catch (error) {
    console.error("Error deleting preparation step:", error);
    next(error);
  }
});




/** recipe_preparation_progress **/

// ✅ Mark a preparation step as completed (personal, family, or spoonacular)
// Examples:
//   PUT /user/my-recipes/42/steps/3/complete
//   PUT /user/my-family-recipes/7/steps/2/complete
//   PUT /user/spoonacular/123456/steps/1/complete

router.put("/user/:type/:recipeId/steps/:stepNumber/complete", async (req, res, next) => {
  try {
    const { type, recipeId, stepNumber } = req.params;
    await recipesLogic.completePreparationStep(
        type,
        parseInt(recipeId),
        parseInt(stepNumber),
        req.user_id
    );
    res.status(200).send({ message: "Step marked as completed ✅" });
  } catch (error) {
    console.error("Error completing step:", error);
    next(error);
  }
});



// 🔽 Unmark a preparation step as completed (personal, family, or spoonacular)
// Examples:
//   PUT /user/my-recipes/42/steps/3/uncomplete
//   PUT /user/my-family-recipes/7/steps/2/uncomplete
//   PUT /user/spoonacular/123456/steps/1/uncomplete

router.put("/user/:type/:recipeId/steps/:stepNumber/uncomplete", async (req, res, next) => {
  try {
    const { type, recipeId, stepNumber } = req.params;

    await recipesLogic.uncompletePreparationStep(
        type,
        parseInt(recipeId),
        parseInt(stepNumber),
        req.user_id
    );

    res.status(200).send({ message: "Step marked as uncompleted 🔄" });
  } catch (error) {
    console.error("Error uncompleting step:", error);
    next(error);
  }
});


// 🔽 Get progress status for a recipe (user/family/spoonacular) for a specific user
// Examples:
//   GET /user/my-recipes/42/steps/progress
//   GET /user/my-family-recipes/15/steps/progress
//   GET /user/spoonacular/339821/steps/progress
/** Return's Value Example -
 *  {
 "total": 4,
 "completed": 1,
 "percentage": 25
 }
 **/

router.get("/user/:type/:recipeId/steps/progress", async (req, res, next) => {
  try {
    const { type, recipeId } = req.params;

    const progress = await recipesLogic.getRecipeProgress(
        type,
        parseInt(recipeId),
        req.user_id
    );

    res.status(200).send(progress);
  } catch (error) {
    console.error("Error retrieving preparation progress:", error);
    next(error);
  }
});


// 🔽 Reset progress tracking for a given recipe type and user
// Examples:
//   DELETE /user/my-recipes/42/steps/progress
//   DELETE /user/my-family-recipes/17/steps/progress
//   DELETE /user/spoonacular/491209/steps/progress

router.delete("/user/:type/:recipeId/steps/progress", async (req, res, next) => {
  try {
    const { type, recipeId } = req.params;

    await recipesLogic.resetRecipeProgress(
        type,
        parseInt(recipeId),
        req.user_id
    );

    res.status(200).send({ message: "Preparation progress reset successfully 🔄" });
  } catch (error) {
    console.error("Error resetting preparation progress:", error);
    next(error);
  }
});




 module.exports = router;
