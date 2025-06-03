const axios = require("axios");
const DButils = require("./DButils");
const userUtils = require("./user_utils");

const api_domain = "https://api.spoonacular.com/recipes";

/** Fetch full info from Spoonacular for a given recipe ID */
async function fetchFromSpoonacular(id) {
    const res = await axios.get(`${api_domain}/${id}/information`, {
        params: {
            includeNutrition: false,
            apiKey: process.env.spooncular_apiKey,
        },
    });
    return res.data;
}

/** Return a short summary (overview) of a Spoonacular recipe */
async function getOverview(id) {
    const data = await fetchFromSpoonacular(id);
    const {
        title, readyInMinutes, image, aggregateLikes,
        vegan, vegetarian, glutenFree,
    } = data;

    return {
        id,
        title,
        readyInMinutes,
        image,
        popularity: aggregateLikes,
        vegan,
        vegetarian,
        glutenFree,
    };
}

/** Get 3 random recipes from Spoonacular — nice and easy */
async function getThreeRandom() {
    const res = await axios.get(`${api_domain}/random`, {
        params: {
            number: 3,
            apiKey: process.env.spoonacular_apiKey,
        },
    });
    return Promise.all(res.data.recipes.map((r) => getOverview(r.id)));
}

/** Pull full recipe info from our local DB */
async function getFullFromDB(recipeId) {
    const [recipe] = await DButils.execQuery(
        `SELECT * FROM recipes WHERE recipe_id='${recipeId}'`
    );
    if (!recipe) return null;

    const ingredients = await DButils.execQuery(
        `SELECT name, amount, unit FROM ingredients WHERE recipe_id='${recipeId}'`
    );

    const steps = recipe.instructions
        ? JSON.parse(recipe.instructions)
        : [];

    return {
        id: recipe.recipe_id,
        title: recipe.title,
        image: recipe.image,
        readyInMinutes: recipe.ready_in_minutes,
        popularity: recipe.popularity,
        vegan: !!recipe.vegan,
        vegetarian: !!recipe.vegetarian,
        glutenFree: !!recipe.gluten_free,
        servings: recipe.servings,
        instructions: steps,
        ingredients,
        createdBy: recipe.created_by,
        occasion: recipe.occasion,
        isFamily: !!recipe.isFamily,
        familyMember: recipe.family_member || null,
    };
}

/** Full recipe info from Spoonacular */
async function getFullFromSpoonacular(recipeId) {
    const data = await fetchFromSpoonacular(recipeId);

    const ingredients = data.extendedIngredients.map((ing) => ({
        name: ing.name,
        amount: ing.amount,
        unit: ing.unit,
    }));

    const instructions = data.analyzedInstructions?.[0]?.steps?.map(s => s.step)
        || (data.instructions ? [data.instructions] : []);

    return {
        id: data.id,
        title: data.title,
        image: data.image,
        readyInMinutes: data.readyInMinutes,
        popularity: data.aggregateLikes,
        vegan: data.vegan,
        vegetarian: data.vegetarian,
        glutenFree: data.glutenFree,
        servings: data.servings,
        ingredients,
        instructions,
        createdBy: data.creditsText || "unknown",
        occasion: data.occasions?.[0] || null,
    };
}

/** Decide which source to use and return full recipe info */
async function getFullRecipeById(recipeId) {
    return recipeId.includes("ID")
        ? await getFullFromDB(recipeId)
        : await getFullFromSpoonacular(recipeId);
}

/** Search Spoonacular using flexible filters */
async function searchRecipesWithParams(filters) {
    const params = {
        apiKey: process.env.spoonacular_apiKey,
        number: filters.limit || 5,
        query: filters.query,
        cuisine: filters.cuisine,
        diet: filters.diet,
        intolerances: filters.intolerances,
        sort: filters.sortBy,
        sortDirection: filters.sortDirection,
    };

    Object.keys(params).forEach((key) => {
        if (params[key] === undefined) delete params[key];
    });

    const res = await axios.get(`${api_domain}/complexSearch`, { params });
    const ids = res.data.results.map((r) => r.id);
    return Promise.all(ids.map((id) => getOverview(id)));
}

/** Like a recipe: either from Spoonacular or from user's DB */
async function likeRecipe(recipeId, userId) {
    const isLocal = recipeId.includes("ID");

    const existing = await DButils.execQuery(`
        SELECT likes_count FROM recipe_likes WHERE recipe_id = '${recipeId}'
    `);

    if (existing.length === 0) {
        const basePopularity = isLocal
            ? await getLocalPopularity(recipeId, userId)
            : (await getOverview(recipeId)).popularity;

        const newPop = basePopularity + 1;

        await DButils.execQuery(`
            INSERT INTO recipe_likes (recipe_id, likes_count)
            VALUES ('${recipeId}', ${newPop})
        `);

        if (isLocal) {
            await DButils.execQuery(`
                UPDATE recipes
                SET popularity = ${newPop}
                WHERE recipe_id = '${recipeId}' AND user_id = '${userId}'
            `);
        }

        return { message: "First like — we boosted it up ✨", recipeId, popularity: newPop };
    }

    const currentPop = Number(existing[0].likes_count);
    const updatedPop = currentPop + 1;

    await DButils.execQuery(`
    UPDATE recipe_likes
    SET likes_count = ${updatedPop}
    WHERE recipe_id = '${recipeId}'
  `);

    if (isLocal) {
        await DButils.execQuery(`
      UPDATE recipes
      SET popularity = ${updatedPop}
      WHERE recipe_id = '${recipeId}' AND user_id = '${userId}'
    `);
    }

    return { message: "Popularity bumped again 💪", recipeId, popularity: updatedPop };
}

/** Get how popular a local recipe is, by user */
async function getLocalPopularity(recipeId, userId) {
    const res = await DButils.execQuery(`
        SELECT popularity FROM recipes
        WHERE recipe_id = '${recipeId}' AND user_id = '${userId}'
    `);
    return res.length ? res[0].popularity : 0;
}

/** Update progress for a specific recipe step for a user */
async function updateRecipeStepProgress(userId, recipeId, stepNumber, status) {
    await DButils.execQuery(`
    INSERT INTO recipe_progress (user_id, recipe_id, step_number, status)
    VALUES ('${userId}', '${recipeId}', ${stepNumber}, '${status}')
    ON DUPLICATE KEY UPDATE status = '${status}'
  `);
}

/** Get full progress for a recipe for a user */
async function getRecipeProgressForUser(userId, recipeId) {
    const rows = await DButils.execQuery(`
    SELECT step_number, status
    FROM recipe_progress
    WHERE user_id = '${userId}' AND recipe_id = '${recipeId}'
  `);

    const progress = {};
    rows.forEach((row) => {
        progress[row.step_number] = row.status;
    });

    return progress;
}


module.exports = {
    getThreeRandom,
    getFullRecipeById,
    searchRecipesWithParams,
    likeRecipe,
    updateRecipeStepProgress,
    getRecipeProgressForUser,
};
