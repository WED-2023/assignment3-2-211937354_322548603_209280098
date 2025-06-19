USE recipes_db;

-- Clear all existing data (disable FK checks temporarily)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE recipe_preparation_progress;
TRUNCATE TABLE recipe_preparation_steps;
TRUNCATE TABLE meal_plans;
TRUNCATE TABLE search_history;
TRUNCATE TABLE recipe_views;
TRUNCATE TABLE user_favorites;
TRUNCATE TABLE family_recipe_ingredients;
TRUNCATE TABLE user_recipe_ingredients;
TRUNCATE TABLE family_recipes;
TRUNCATE TABLE user_recipes;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- Insert into Table 1: users
-- Passwords: alice='password1', bob='password2', carol='password3' (all hashed with BCRYPT_ROUNDS=11)
INSERT INTO users (username, first_name, last_name, country, email, hashedPassword)
VALUES
    ('alice', 'Alice', 'Johnson', 'USA', 'alice@example.com', '$2b$11$QIXVFjQqAJPGkgJzN9pNTOXaV9fgJPKJVcNkBrUJoGJ5zQYhBxlPG'), -- password1
    ('bob', 'Bob', 'Smith', 'Canada', 'bob@example.com', '$2b$11$HvQJFWNZAKfgshJZGNqtfONNGGkP4JJVEcEQtKf.5zFEjPJmGdN8u'), -- password2
    ('carol', 'Carol', 'Davis', 'UK', 'carol@example.com', '$2b$11$mWNXPqBvgJTZGJtfgJFheeZJ4FgjhJRFjhJFjhJGjhJRFjhJRFjK.'), -- password3
    ('Lidor','Lidor','Mashiach','Israel','Lidorm1612@gmail.com','$2b$11$aZUjwdnAcyYg.XtVGuaHNOnrwHZzqasdtk57lnakBf/Bk708lYSH2');

-- Insert into Table 2: user_recipes
INSERT INTO user_recipes (user_id, title, image_url, ready_in_minutes, popularity_score, is_vegan, is_vegetarian, is_gluten_free, servings, summary, instructions)
VALUES
    (1, 'Vegan Quinoa Salad', 'https://shaneandsimple.com/wp-content/uploads/2024/04/EASY-Mediterranean-Quinoa-Salad-simple-oilfree-healthy-recipes-shaneandsimple-2-1157x1536.jpg', 20, 85, TRUE, TRUE, TRUE, 4, 'Fresh and healthy quinoa salad with vegetables', 'Cook quinoa, chop vegetables, mix with dressing'),
    (2, 'Classic Spaghetti Carbonara', 'https://www.sweetteaandthyme.com/wp-content/uploads/2018/09/spaghetti-alla-carbonara-45-e1545077413444.jpg', 25, 92, FALSE, FALSE, FALSE, 2, 'Traditional Italian pasta with eggs and pancetta', 'Cook pasta, prepare sauce, combine carefully'),
    (3, 'Chocolate Chip Cookies', 'https://www.onceuponachef.com/images/2021/11/Best-Chocolate-Chip-Cookies.jpg', 30, 78, FALSE, TRUE, FALSE, 24, 'Homemade chocolate chip cookies', 'Mix ingredients, form cookies, bake until golden');

-- Insert into Table 3: user_recipe_ingredients
INSERT INTO user_recipe_ingredients (recipe_id, ingredient_name, amount, unit)
VALUES
    -- Ingredients for Quinoa Salad (recipe_id=1)
    (1, 'Quinoa', 200, 'grams'),
    (1, 'Cherry Tomatoes', 150, 'grams'),
    (1, 'Cucumber', 1, 'piece'),
    -- Ingredients for Carbonara (recipe_id=2)
    (2, 'Spaghetti', 200, 'grams'),
    (2, 'Pancetta', 100, 'grams'),
    (2, 'Eggs', 2, 'pieces'),
    -- Ingredients for Cookies (recipe_id=3)
    (3, 'Flour', 250, 'grams'),
    (3, 'Chocolate Chips', 200, 'grams'),
    (3, 'Butter', 125, 'grams');

-- Insert into Table 4: family_recipes
INSERT INTO family_recipes (user_id, title, owner_name, when_to_prepare, image_url, ready_in_minutes, servings, instructions)
VALUES
    (1, 'Grandma Rose Chicken Soup', 'Grandma Rose', 'When someone is sick or during cold weather', 'https://example.com/chicken-soup.jpg', 120, 6, 'Simmer chicken with vegetables for 2 hours until tender'),
    (2, 'Uncle Tony Pizza Dough', 'Uncle Tony', 'Friday night family dinners', 'https://example.com/pizza-dough.jpg', 90, 4, 'Mix ingredients, knead well, let rise, then use for pizza'),
    (3, 'Mom Apple Pie', 'Mom Sarah', 'Thanksgiving and special occasions', 'https://example.com/apple-pie.jpg', 75, 8, 'Prepare filling, roll dough, assemble and bake until golden');

-- Insert into Table 5: family_recipe_ingredients
INSERT INTO family_recipe_ingredients (recipe_id, ingredient_name, amount, unit)
VALUES
    -- Ingredients for Chicken Soup (recipe_id=1)
    (1, 'Whole Chicken', 1, 'piece'),
    (1, 'Carrots', 3, 'pieces'),
    (1, 'Celery', 3, 'stalks'),
    -- Ingredients for Pizza Dough (recipe_id=2)
    (2, 'Bread Flour', 500, 'grams'),
    (2, 'Active Dry Yeast', 7, 'grams'),
    (2, 'Olive Oil', 30, 'ml'),
    -- Ingredients for Apple Pie (recipe_id=3)
    (3, 'Apples', 6, 'pieces'),
    (3, 'Pie Crust', 2, 'pieces'),
    (3, 'Sugar', 150, 'grams');

-- Insert into Table 6: user_favorites
INSERT INTO user_favorites (user_id, recipe_id,source)
VALUES
    (1, 123456, 'user'),
    (2, 234567, 'user'),
    (3, 345678, 'user'),
    (4,1096168,'spoonacular'),
    (4,1096167,'spoonacular'),
    (4,1096169,'spoonacular'),
    (4,1096166,'spoonacular');


-- Insert into Table 7: recipe_views
INSERT INTO recipe_views (user_id, spoonacular_recipe_id, user_recipe_id, family_recipe_id)
VALUES
    (1, 123456, NULL, NULL),  -- Alice viewed a Spoonacular recipe
    (2, NULL, 1, NULL),       -- Bob viewed Alice's quinoa salad
    (3, NULL, NULL, 1);       -- Carol viewed Alice's family chicken soup

-- Insert into Table 8: search_history
INSERT INTO search_history (user_id, search_query, cuisine_filter, diet_filter, intolerance_filter, results_limit)
VALUES
    (1, 'healthy vegan recipes', 'Mediterranean', 'vegan', 'nuts', 10),
    (2, 'quick pasta dishes', 'Italian', 'none', 'none', 5),
    (3, 'dessert recipes', 'American', 'vegetarian', 'gluten', 8);

-- Insert into Table 9: meal_plans
INSERT INTO meal_plans (user_id, recipe_id, source, order_in_meal)
VALUES
    (1, 123456, 'spoonacular', 1),  -- Alice planned a Spoonacular recipe first
    (2, 2,        'user',       1),  -- Bob planned his carbonara first
    (3, 3,        'family',     1);  -- Carol planned her mom's apple pie first


-- Insert into Table 10: recipe_preparation_progress
INSERT INTO recipe_preparation_progress (user_id, spoonacular_recipe_id, user_recipe_id, family_recipe_id, step_number, is_completed, completed_at)
VALUES
    (1, 123456, NULL, NULL, 1, TRUE, '2025-06-04 10:30:00'),   -- Alice completed step 1 of Spoonacular recipe
    (2, NULL, 2, NULL, 1, TRUE, '2025-06-04 18:15:00'),        -- Bob completed step 1 of carbonara
    (3, NULL, NULL, 3, 1, FALSE, NULL);                        -- Carol hasn't completed step 1 of apple pie

-- Insert into Table 11: recipe_preparation_steps
INSERT INTO recipe_preparation_steps (user_recipe_id, family_recipe_id, step_number, step_description)
VALUES
    -- Steps for user recipes
    (1, NULL, 1, 'Rinse quinoa thoroughly and cook according to package directions'),
    (2, NULL, 1, 'Bring large pot of salted water to boil for pasta'),
    (3, NULL, 1, 'Preheat oven to 375°F and prepare baking sheets'),
    -- Steps for family recipes
    (NULL, 1, 1, 'Place whole chicken in large pot with cold water to cover'),
    (NULL, 2, 1, 'Dissolve yeast in warm water and let foam for 5 minutes'),
    (NULL, 3, 1, 'Peel and slice apples, toss with sugar and cinnamon');