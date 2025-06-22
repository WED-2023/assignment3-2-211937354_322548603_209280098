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
-- Lidor='Lidor!23'
INSERT INTO users (username, first_name, last_name, country, email, hashedPassword)
VALUES
    ('alice', 'Alice', 'Johnson', 'USA', 'alice@example.com', '$2b$11$QIXVFjQqAJPGkgJzN9pNTOXaV9fgJPKJVcNkBrUJoGJ5zQYhBxlPG'),
    ('bob', 'Bob', 'Smith', 'Canada', 'bob@example.com', '$2b$11$HvQJFWNZAKfgshJZGNqtfONNGGkP4JJVEcEQtKf.5zFEjPJmGdN8u'),
    ('carol', 'Carol', 'Davis', 'UK', 'carol@example.com', '$2b$11$mWNXPqBvgJTZGJtfgJFheeZJ4FgjhJRFjhJFjhJGjhJRFjhJRFjK.'),
    ('Lidor','Lidor','Mashiach','Israel','Lidorm1612@gmail.com','$2b$11$aZUjwdnAcyYg.XtVGuaHNOnrwHZzqasdtk57lnakBf/Bk708lYSH2');

-- Insert into Table 2: user_recipes
INSERT INTO user_recipes (user_id, title, image_url, ready_in_minutes, is_vegan, is_vegetarian, is_gluten_free, servings, summary, instructions)
VALUES
    (1, 'Vegan Quinoa Salad', 'https://shaneandsimple.com/wp-content/uploads/2024/04/EASY-Mediterranean-Quinoa-Salad-simple-oilfree-healthy-recipes-shaneandsimple-2-1157x1536.jpg', 20, TRUE, TRUE, TRUE, 4, 'Fresh and healthy quinoa salad with vegetables', 'This is a light and refreshing salad perfect for any occasion.'),
    (2, 'Classic Spaghetti Carbonara', 'https://www.sweetteaandthyme.com/wp-content/uploads/2018/09/spaghetti-alla-carbonara-45-e1545077413444.jpg', 25, FALSE, FALSE, FALSE, 2, 'Traditional Italian pasta with eggs and pancetta', 'This pasta dish combines savory pancetta with a creamy egg-based sauce.'),
    (3, 'Chocolate Chip Cookies', 'https://www.onceuponachef.com/images/2021/11/Best-Chocolate-Chip-Cookies.jpg', 30, FALSE, TRUE, FALSE, 24, 'Homemade chocolate chip cookies', 'These cookies are crispy on the outside and chewy on the inside.'),
    (4, 'Green Omelette', 'https://www.encore-more.com/wp-content/uploads/2021/07/Herbs-Greens-Omelette-Encore-More-e1626452421527-500x500.jpg', 10, FALSE, TRUE, TRUE, 2, 'A light, healthy herb omelette with a Mediterranean twist.', 'A quick and nutritious omelette with a refreshing herbal flavor.'),
    (4, 'Lamb Chops with Garlic & Rosemary', 'https://tatyanaseverydayfood.com/wp-content/uploads/2020/06/Garlic-Herb-Grilled-Lamb-Chops-3-768x1024.jpg', 35, FALSE, FALSE, TRUE, 2, 'Juicy lamb chops marinated with garlic, rosemary, and olive oil – seared to perfection.', 'Tender lamb chops that deliver bold flavors and a satisfying texture.'),
    (4, 'Chestnut Mushroom Gnocchi', 'https://annabanana.co/wp-content/uploads/2017/09/Mushroom-Gnocchi-with-Thyme-11-of-17-1.jpg', 25, FALSE, TRUE, FALSE, 3, 'Creamy gnocchi with sautéed chestnut mushrooms, garlic, thyme, and parmesan.', 'A creamy and earthy pasta dish with rich mushroom notes and herbs.'),
    (4,'Protein Pancakes','https://www.nourishandtempt.com/wp-content/uploads/2020/02/84706250_161851665248125_7360174580574453760_n.jpg',20,FALSE,TRUE,FALSE,2,'Great for breakfast!','A high-protein, easy-to-make breakfast option perfect for busy mornings.');


-- Insert into Table 3: user_recipe_ingredients
INSERT INTO user_recipe_ingredients (recipe_id, ingredient_name, amount, unit)
VALUES
    (1, 'Quinoa', 200, 'grams'),
    (1, 'Cherry Tomatoes', 150, 'grams'),
    (1, 'Cucumber', 1, 'piece'),

    (2, 'Spaghetti', 200, 'grams'),
    (2, 'Pancetta', 100, 'grams'),
    (2, 'Eggs', 2, 'pieces'),

    (3, 'Flour', 250, 'grams'),
    (3, 'Chocolate Chips', 200, 'grams'),
    (3, 'Butter', 125, 'grams'),

    (4, 'Eggs', 2, 'pieces'),
    (4, 'Fresh Herbs', 10, 'grams'),
    (4, 'Olive Oil', 1, 'tbsp'),

    (5, 'Lamb Chops', 500, 'grams'),
    (5, 'Garlic Cloves', 3, 'pieces'),
    (5, 'Fresh Rosemary', 2, 'sprigs'),
    (5, 'Olive Oil', 2, 'tbsp'),

    (6, 'Chestnut Mushrooms', 200, 'grams'),
    (6, 'Gnocchi', 400, 'grams'),
    (6, 'Heavy Cream', 100, 'ml'),
    (6, 'Parmesan Cheese', 50, 'grams'),
    (6, 'Thyme', 1, 'tsp'),

    (7, 'Oats', 100, 'grams'),
    (7, 'Protein Powder', 30, 'grams'),
    (7, 'Eggs', 2, 'pieces'),
    (7, 'Milk', 100, 'ml');

-- Insert into Table 4: family_recipes
INSERT INTO family_recipes (user_id, title, owner_name, when_to_prepare, image_url, ready_in_minutes, servings, instructions)
VALUES
    (1, 'Grandma Rose Chicken Soup', 'Grandma Rose', 'When someone is sick or during cold weather', 'https://www.recipetineats.com/tachyon/2017/05/Chicken-Noodle-Soup-from-scratch_3.jpg', 120, 6, 'Simmer chicken with vegetables for 2 hours until tender'),
    (2, 'Uncle Tony Pizza Dough', 'Uncle Tony', 'Friday night family dinners', 'https://joyfoodsunshine.com/wp-content/uploads/2018/09/easy-homemade-pizza-dough-recipe-2-1.jpg', 90, 4, 'Mix ingredients, knead well, let rise, then use for pizza'),
    (3, 'Mom Apple Pie', 'Mom Sarah', 'Thanksgiving and special occasions', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcShGvV_1zfnQCiMnjXk7by4zrlZKJQw1yvBIg&s', 75, 8, 'Prepare filling, roll dough, assemble and bake until golden'),
    -- Family Recipes for user_id = 4:
    (4, 'Moroccan Spicy Fish (Chraimeh)', 'Mom', 'Friday dinner or special Shabbat meals', 'https://www.myjewishlearning.com/wp-content/uploads/2022/08/FishStewHeader2-1.png', 60, 4, 'Cook white fish in a spicy tomato sauce with garlic, paprika, and cumin. Serve hot.'),
    (4, 'Broccoli Pie', 'Mom', 'Midweek dinner or potluck events', 'https://media.30seconds.com/tip_image/lg/Easy-6-Ingredient-Broccoli-Cheese-Casserole-Pie-Re-17652-b005c1599b-1695660814.jpg', 50, 6, 'Mix cooked broccoli with cheese and eggs, pour into pie crust, and bake until set.'),
    (4, 'Rice Paper Bourekas', 'Ofir', 'Brunches and light dinners', 'https://allwaysdelicious.com/wp-content/uploads/2021/09/borekas-18.jpg', 40, 4, 'Fill rice paper with mashed potatoes and cheese, fold into triangles, bake or pan-fry.');

-- Insert into Table 5: family_recipe_ingredients
INSERT INTO family_recipe_ingredients (recipe_id, ingredient_name, amount, unit)
VALUES
    (1, 'Whole Chicken', 1, 'piece'),
    (1, 'Carrots', 3, 'pieces'),
    (1, 'Celery', 3, 'stalks'),
    (2, 'Bread Flour', 500, 'grams'),
    (2, 'Active Dry Yeast', 7, 'grams'),
    (2, 'Olive Oil', 30, 'ml'),
    (3, 'Apples', 6, 'pieces'),
    (3, 'Pie Crust', 2, 'pieces'),
    (3, 'Sugar', 150, 'grams'),

    -- Ingredients for Moroccan Spicy Fish (Chraimeh) - recipe_id = 4
    (4, 'White Fish Fillets', 600, 'grams'),
    (4, 'Garlic Cloves', 4, 'pieces'),
    (4, 'Paprika', 1, 'tbsp'),
    (4, 'Ground Cumin', 1, 'tsp'),
    (4, 'Tomato Paste', 3, 'tbsp'),
    (4, 'Olive Oil', 2, 'tbsp'),

    -- Ingredients for Broccoli Pie - recipe_id = 5
    (5, 'Broccoli Florets', 400, 'grams'),
    (5, 'Cheddar Cheese', 150, 'grams'),
    (5, 'Eggs', 3, 'pieces'),
    (5, 'Milk', 100, 'ml'),
    (5, 'Pie Crust', 1, 'piece'),

    -- Ingredients for Rice Paper Bourekas - recipe_id = 6
    (6, 'Rice Paper Sheets', 8, 'pieces'),
    (6, 'Mashed Potatoes', 300, 'grams'),
    (6, 'Feta Cheese', 150, 'grams'),
    (6, 'Black Pepper', 0.5, 'tsp'),
    (6, 'Olive Oil', 1, 'tbsp');

-- Insert into Table 6: user_favorites
INSERT INTO user_favorites (user_id, recipe_id, source)
VALUES
    (1, 1, 'user'),
    (2, 2, 'user'),
    (3, 3, 'family'),
    (4, 1096168, 'spoonacular'),
    (4, 1096167, 'spoonacular'),
    (4, 1096169, 'spoonacular'),
    (4, 1096166, 'spoonacular'),
    (4, 7, 'user'),
    (4, 4, 'family'),
    (4, 6, 'family');

-- Insert into Table 7: recipe_views
INSERT INTO recipe_views (user_id, spoonacular_recipe_id, user_recipe_id, family_recipe_id)
VALUES
    (1, 123456, NULL, NULL),
    (2, 1096169, NULL, NULL),
    (3, 1096166, NULL, NULL),
    (3, 1096168, NULL, NULL),
    (3, 1096169, NULL, NULL),
    (3, 123456, NULL, NULL),
    (4, 1096169, NULL, NULL),
    (4, 1096168, NULL, NULL),
    (4, 123456, NULL, NULL);

-- Insert into Table 8: search_history
INSERT INTO search_history (user_id, search_query, cuisine_filter, diet_filter, intolerance_filter, results_limit)
VALUES
    (1, 'healthy vegan recipes', 'Mediterranean', 'vegan', 'nuts', 10),
    (2, 'quick pasta dishes', 'Italian', NULL, NULL, 5),
    (3, 'dessert recipes', 'American', 'vegetarian', 'gluten', 8),
    (4, 'shawarma', 'turkish', NULL, NULL, 15);

-- Insert into Table 9: meal_plans
INSERT INTO meal_plans (user_id, recipe_id, source, order_in_meal)
VALUES
    (1, 123456, 'spoonacular', 1),
    (2, 2, 'user', 1),
    (3, 3, 'family', 1),
    (4, 123456, 'spoonacular', 1),
    (4,4,'family',2),
    (4, 4, 'user', 3),
    (4, 6, 'user', 4),
    (4, 5, 'user', 5),
    (4, 1096168, 'spoonacular', 6);

-- Insert into Table 11: recipe_preparation_steps
INSERT INTO recipe_preparation_steps (user_recipe_id, family_recipe_id, step_number, step_description)
VALUES
    -- user_id 1
    (1, NULL, 1, 'Rinse quinoa thoroughly.'),
    (1, NULL, 2, 'Boil water and add quinoa.'),
    (1, NULL, 3, 'Chop vegetables and mix with cooked quinoa.'),
    -- user_id 2
    (2, NULL, 1, 'Boil pasta in salted water.'),
    (2, NULL, 2, 'Cook pancetta in a pan.'),
    (2, NULL, 3, 'Mix eggs and cheese, then combine all.'),
    -- user_id 3
    (3, NULL, 1, 'Preheat oven to 180°C.'),
    (3, NULL, 2, 'Mix ingredients and scoop onto tray.'),
    (3, NULL, 3, 'Bake until golden brown.'),
    -- user_id 4: Green Omelette
    (4, NULL, 1, 'Crack the eggs into a bowl and whisk well.'),
    (4, NULL, 2, 'Chop fresh herbs and add to the egg mixture.'),
    (4, NULL, 3, 'Heat pan and cook mixture on low heat.'),
    (4, NULL, 4, 'Fold and serve warm.'),
    -- Lamb Chops
    (5, NULL, 1, 'Marinate lamb with garlic, rosemary, and olive oil.'),
    (5, NULL, 2, 'Let the lamb rest for 30 minutes.'),
    (5, NULL, 3, 'Sear lamb on high heat until browned.'),
    (5, NULL, 4, 'Let lamb rest and serve.'),
    -- Gnocchi
    (6, NULL, 1, 'Boil salted water and cook gnocchi until floating.'),
    (6, NULL, 2, 'Sauté mushrooms with butter, garlic, and thyme.'),
    (6, NULL, 3, 'Add cream and parmesan to the pan.'),
    (6, NULL, 4, 'Mix gnocchi and sauce, serve warm.'),
    -- Pancakes
    (7, NULL, 1, 'Mix protein powder, oats, and eggs in a bowl.'),
    (7, NULL, 2, 'Pour mixture onto heated non-stick pan.'),
    (7, NULL, 3, 'Flip pancakes after bubbles form.'),
    (7, NULL, 4, 'Serve with desired toppings.'),
    -- Family Recipes: user_id 1
    (NULL, 1, 1, 'Place whole chicken in large pot with cold water.'),
    (NULL, 1, 2, 'Add vegetables and simmer for 2 hours.'),
    (NULL, 1, 3, 'Skim fat, season, and serve hot.'),
    -- Family Recipes: user_id 2
    (NULL, 2, 1, 'Mix flour, yeast, and water.'),
    (NULL, 2, 2, 'Knead dough and let it rise.'),
    (NULL, 2, 3, 'Roll and shape into pizza base.'),
    -- Family Recipes: user_id 3
    (NULL, 3, 1, 'Peel and slice apples.'),
    (NULL, 3, 2, 'Prepare crust and fill with apples.'),
    (NULL, 3, 3, 'Bake until crust is golden.'),
    -- Family Recipes: user_id 4
    (NULL, 4, 1, 'Heat oil and fry garlic and paprika.'),
    (NULL, 4, 2, 'Add tomato paste and water to create sauce.'),
    (NULL, 4, 3, 'Place fish in sauce and simmer for 25 minutes.'),
    (NULL, 4, 4, 'Garnish with cilantro and serve hot.'),
    (NULL, 5, 1, 'Steam broccoli until tender.'),
    (NULL, 5, 2, 'Mix with cheese and eggs in large bowl.'),
    (NULL, 5, 3, 'Pour into crust and bake at 180°C.'),
    (NULL, 5, 4, 'Let cool slightly before serving.'),
    (NULL, 6, 1, 'Soak rice paper until soft.'),
    (NULL, 6, 2, 'Fill with mashed potato and cheese.'),
    (NULL, 6, 3, 'Fold into triangle shape.'),
    (NULL, 6, 4, 'Bake or pan-fry until golden.');


-- Insert into Table 10: recipe_preparation_progress
INSERT INTO recipe_preparation_progress (user_id, spoonacular_recipe_id, user_recipe_id, family_recipe_id, step_number, is_completed, completed_at, session_active)
VALUES
    -- 3x3 + 4x4 (user_id 1–4): user_recipes
    (1, NULL, 1, NULL, 1, FALSE, NULL, TRUE),
    (1, NULL, 1, NULL, 2, FALSE, NULL, TRUE),
    (1, NULL, 1, NULL, 3, FALSE, NULL, TRUE),
    (2, NULL, 2, NULL, 1, FALSE, NULL, TRUE),
    (2, NULL, 2, NULL, 2, FALSE, NULL, TRUE),
    (2, NULL, 2, NULL, 3, FALSE, NULL, TRUE),
    (3, NULL, 3, NULL, 1, FALSE, NULL, TRUE),
    (3, NULL, 3, NULL, 2, FALSE, NULL, TRUE),
    (3, NULL, 3, NULL, 3, FALSE, NULL, TRUE),
    (4, NULL, 4, NULL, 1, FALSE, NULL, TRUE),
    (4, NULL, 4, NULL, 2, FALSE, NULL, TRUE),
    (4, NULL, 4, NULL, 3, FALSE, NULL, TRUE),
    (4, NULL, 4, NULL, 4, FALSE, NULL, TRUE),
    (4, NULL, 5, NULL, 1, FALSE, NULL, TRUE),
    (4, NULL, 5, NULL, 2, FALSE, NULL, TRUE),
    (4, NULL, 5, NULL, 3, FALSE, NULL, TRUE),
    (4, NULL, 5, NULL, 4, FALSE, NULL, TRUE),
    (4, NULL, 6, NULL, 1, FALSE, NULL, TRUE),
    (4, NULL, 6, NULL, 2, FALSE, NULL, TRUE),
    (4, NULL, 6, NULL, 3, FALSE, NULL, TRUE),
    (4, NULL, 6, NULL, 4, FALSE, NULL, TRUE),
    (4, NULL, 7, NULL, 1, FALSE, NULL, TRUE),
    (4, NULL, 7, NULL, 2, FALSE, NULL, TRUE),
    (4, NULL, 7, NULL, 3, FALSE, NULL, TRUE),
    (4, NULL, 7, NULL, 4, FALSE, NULL, TRUE),
    -- Family: 3x3 + 4x4
    (1, NULL, NULL, 1, 1, FALSE, NULL, TRUE),
    (1, NULL, NULL, 1, 2, FALSE, NULL, TRUE),
    (1, NULL, NULL, 1, 3, FALSE, NULL, TRUE),
    (2, NULL, NULL, 2, 1, FALSE, NULL, TRUE),
    (2, NULL, NULL, 2, 2, FALSE, NULL, TRUE),
    (2, NULL, NULL, 2, 3, FALSE, NULL, TRUE),
    (3, NULL, NULL, 3, 1, FALSE, NULL, TRUE),
    (3, NULL, NULL, 3, 2, FALSE, NULL, TRUE),
    (3, NULL, NULL, 3, 3, FALSE, NULL, TRUE),
    (4, NULL, NULL, 4, 1, FALSE, NULL, TRUE),
    (4, NULL, NULL, 4, 2, FALSE, NULL, TRUE),
    (4, NULL, NULL, 4, 3, FALSE, NULL, TRUE),
    (4, NULL, NULL, 4, 4, FALSE, NULL, TRUE),
    (4, NULL, NULL, 5, 1, FALSE, NULL, TRUE),
    (4, NULL, NULL, 5, 2, FALSE, NULL, TRUE),
    (4, NULL, NULL, 5, 3, FALSE, NULL, TRUE),
    (4, NULL, NULL, 5, 4, FALSE, NULL, TRUE),
    (4, NULL, NULL, 6, 1, FALSE, NULL, TRUE),
    (4, NULL, NULL, 6, 2, FALSE, NULL, TRUE),
    (4, NULL, NULL, 6, 3, FALSE, NULL, TRUE),
    (4, NULL, NULL, 6, 4, FALSE, NULL, TRUE);
