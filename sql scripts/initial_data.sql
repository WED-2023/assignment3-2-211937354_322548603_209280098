USE recipes_db;

-- Force Deleting old memory
DELETE FROM recipe_preparation_steps;
DELETE FROM recipe_preparation_progress;
DELETE FROM meal_plans;
DELETE FROM search_history;
DELETE FROM recipe_views;
DELETE FROM user_favorites;
DELETE FROM family_recipe_ingredients;
DELETE FROM family_recipes;
DELETE FROM user_recipe_ingredients;
DELETE FROM user_recipes;
DELETE FROM users;

-- Insert Users
INSERT INTO users (username, first_name, last_name, country, email, password_hash)
VALUES
    ('alice', 'Alice', 'Smith', 'USA', 'alice@example.com', 'hashed123'),
    ('bob', 'Bob', 'Brown', 'Canada', 'bob@example.com', 'hashed456'),
    ('carol', 'Carol', 'Jones', 'UK', 'carol@example.com', 'hashed789');

-- Insert User Recipes
INSERT INTO user_recipes (user_id, title, image_url, ready_in_minutes, popularity_score, is_vegan, is_vegetarian, is_gluten_free, servings, summary, instructions)
VALUES
    (1, 'Vegan Salad', 'http://img.com/salad.jpg', 10, 5, TRUE, TRUE, TRUE, 2, 'A fresh vegan salad', 'Mix all veggies.'),
    (2, 'Pasta Bolognese', 'http://img.com/pasta.jpg', 30, 8, FALSE, FALSE, FALSE, 4, 'Classic meat pasta', 'Cook pasta and sauce.'),
    (3, 'Fruit Smoothie', 'http://img.com/smoothie.jpg', 5, 6, TRUE, TRUE, TRUE, 1, 'Healthy smoothie', 'Blend fruits.');

-- Insert User Recipe Ingredients
INSERT INTO user_recipe_ingredients (recipe_id, ingredient_name, amount, unit)
VALUES
    (1, 'Lettuce', 1, 'head'),
    (1, 'Tomato', 2, 'pieces'),
    (2, 'Pasta', 200, 'grams'),
    (2, 'Minced Meat', 150, 'grams'),
    (3, 'Banana', 1, 'piece'),
    (3, 'Milk', 200, 'ml');

-- Insert Family Recipes
INSERT INTO family_recipes (user_id, title, owner_name, when_to_prepare, image_url, ready_in_minutes, servings, instructions)
VALUES
    (1, 'Grandma Soup', 'Grandma Lily', 'Winter evenings', 'http://img.com/soup.jpg', 60, 5, 'Boil and simmer.'),
    (2, 'Holiday Cake', 'Uncle Joe', 'Holiday season', 'http://img.com/cake.jpg', 90, 8, 'Bake carefully.');

-- Insert Family Recipe Ingredients
INSERT INTO family_recipe_ingredients (recipe_id, ingredient_name, amount, unit)
VALUES
    (1, 'Carrot', 2, 'pieces'),
    (1, 'Chicken', 500, 'grams'),
    (2, 'Flour', 300, 'grams'),
    (2, 'Sugar', 150, 'grams');

-- Insert Favorites
INSERT INTO user_favorites (user_id, spoonacular_recipe_id)
VALUES
    (1, 101010),
    (2, 202020),
    (3, 303030);

-- Insert Views
INSERT INTO recipe_views (user_id, spoonacular_recipe_id)
VALUES
    (1, 101010),
    (1, 202020),
    (2, 202020),
    (3, 303030);

-- Insert Search History
INSERT INTO search_history (user_id, search_query, cuisine_filter, diet_filter, intolerance_filter)
VALUES
    (1, 'vegan pasta', 'Italian', 'vegan', 'gluten'),
    (2, 'chicken soup', 'American', 'none', 'none');

-- Insert Meal Plans
INSERT INTO meal_plans (user_id, spoonacular_recipe_id, user_recipe_id, family_recipe_id, order_in_meal)
VALUES
    (1, NULL, 1, NULL, 1),
    (1, NULL, NULL, 1, 2),
    (2, 202020, NULL, NULL, 1);

-- Insert Recipe Preparation Progress
INSERT INTO recipe_preparation_progress (user_id, spoonacular_recipe_id, user_recipe_id, family_recipe_id, step_number, is_completed)
VALUES
    (1, NULL, 1, NULL, 1, TRUE),
    (1, NULL, 1, NULL, 2, FALSE),
    (2, NULL, NULL, 1, 1, TRUE);

-- Insert Recipe Steps
INSERT INTO recipe_preparation_steps (user_recipe_id, family_recipe_id, step_number, step_description)
VALUES
    (1, NULL, 1, 'Wash and chop lettuce'),
    (1, NULL, 2, 'Add tomatoes'),
    (NULL, 1, 1, 'Boil the chicken'),
    (NULL, 1, 2, 'Add carrots and cook');
