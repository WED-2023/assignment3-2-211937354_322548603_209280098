DROP DATABASE IF EXISTS recipes_db;
CREATE DATABASE recipes_db;

USE recipes_db;


-- Table 1: users
CREATE TABLE users (
                       user_id INT AUTO_INCREMENT PRIMARY KEY,
                       username VARCHAR(8) NOT NULL UNIQUE,
                       first_name VARCHAR(50) NOT NULL,
                       last_name VARCHAR(50) NOT NULL,
                       country VARCHAR(100) NOT NULL,
                       email VARCHAR(255) NOT NULL UNIQUE,
                       hashedPassword VARCHAR(255) NOT NULL,
                       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table 2: user_recipes
CREATE TABLE user_recipes (
                              recipe_id INT AUTO_INCREMENT PRIMARY KEY,
                              user_id INT NOT NULL,
                              title VARCHAR(255) NOT NULL,
                              image_url VARCHAR(500),
                              ready_in_minutes INT,
                              is_vegan BOOLEAN DEFAULT FALSE,
                              is_vegetarian BOOLEAN DEFAULT FALSE,
                              is_gluten_free BOOLEAN DEFAULT FALSE,
                              servings INT,
                              summary TEXT,
                              instructions TEXT,
                              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                              FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);


-- Table 3: user_recipe_ingredients
CREATE TABLE user_recipe_ingredients (
                                         ingredient_id INT AUTO_INCREMENT PRIMARY KEY,
                                         recipe_id INT NOT NULL,
                                         ingredient_name VARCHAR(255) NOT NULL,
                                         amount DECIMAL(10,2),
                                         unit VARCHAR(50),
                                         FOREIGN KEY (recipe_id) REFERENCES user_recipes(recipe_id) ON DELETE CASCADE
);

-- Table 4: family_recipes
CREATE TABLE family_recipes (
                                recipe_id INT AUTO_INCREMENT PRIMARY KEY,
                                user_id INT NOT NULL,
                                title VARCHAR(255) NOT NULL,
                                owner_name VARCHAR(100) NOT NULL,
                                when_to_prepare TEXT,
                                image_url VARCHAR(500),
                                ready_in_minutes INT,
                                servings INT,
                                instructions TEXT,
                                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Table 5: family_recipe_ingredients
CREATE TABLE family_recipe_ingredients (
                                           ingredient_id INT AUTO_INCREMENT PRIMARY KEY,
                                           recipe_id INT NOT NULL,
                                           ingredient_name VARCHAR(255) NOT NULL,
                                           amount DECIMAL(10,2),
                                           unit VARCHAR(50),
                                           FOREIGN KEY (recipe_id) REFERENCES family_recipes(recipe_id) ON DELETE CASCADE
);

-- Table 6: user_favorites
CREATE TABLE user_favorites (
                                favorite_id INT AUTO_INCREMENT PRIMARY KEY,
                                user_id INT NOT NULL,
                                recipe_id INT NOT NULL,
                                source ENUM('spoonacular', 'user', 'family') NOT NULL DEFAULT 'spoonacular',
                                added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
                                UNIQUE KEY unique_user_recipe (user_id, recipe_id)
);


-- Table 7: recipe_views
CREATE TABLE recipe_views (
                              view_id INT AUTO_INCREMENT PRIMARY KEY,
                              user_id INT NOT NULL,
                              spoonacular_recipe_id INT NULL,
                              user_recipe_id INT NULL,
                              family_recipe_id INT NULL,
                              viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NULL,
                              CONSTRAINT recipe_views_ibfk_1 FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_user_viewed_at ON recipe_views(user_id, viewed_at);


-- Table 8: search_history
CREATE TABLE search_history (
                                search_id INT AUTO_INCREMENT PRIMARY KEY,
                                user_id INT NOT NULL,
                                search_query VARCHAR(255),
                                cuisine_filter VARCHAR(100),
                                diet_filter VARCHAR(100),
                                intolerance_filter VARCHAR(100),
                                results_limit INT DEFAULT 5,
                                searched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
                                INDEX idx_user_search_time (user_id, searched_at)
);

-- Table 9: meal_plans
CREATE TABLE meal_plans (
                            plan_id INT AUTO_INCREMENT PRIMARY KEY,
                            user_id INT NOT NULL,
                            recipe_id INT NOT NULL,
                            source ENUM('spoonacular', 'user', 'family') NOT NULL,
                            order_in_meal INT NOT NULL,
                            added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
                            UNIQUE KEY unique_user_recipe (user_id, recipe_id, source)
);


-- Table 10: recipe_preparation_progress
CREATE TABLE recipe_preparation_progress (
                                             progress_id INT AUTO_INCREMENT PRIMARY KEY,
                                             user_id INT NOT NULL,
                                             spoonacular_recipe_id INT,
                                             user_recipe_id INT,
                                             family_recipe_id INT,
                                             step_number INT NOT NULL,
                                             is_completed BOOLEAN DEFAULT FALSE,
                                             completed_at TIMESTAMP NULL,
                                             session_active BOOLEAN DEFAULT TRUE,
                                             created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                             FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
                                             FOREIGN KEY (user_recipe_id) REFERENCES user_recipes(recipe_id) ON DELETE CASCADE,
                                             FOREIGN KEY (family_recipe_id) REFERENCES family_recipes(recipe_id) ON DELETE CASCADE,
                                             CONSTRAINT chk_single_recipe_type_progress CHECK (
                                                 (spoonacular_recipe_id IS NOT NULL AND user_recipe_id IS NULL AND family_recipe_id IS NULL) OR
                                                 (spoonacular_recipe_id IS NULL AND user_recipe_id IS NOT NULL AND family_recipe_id IS NULL) OR
                                                 (spoonacular_recipe_id IS NULL AND user_recipe_id IS NULL AND family_recipe_id IS NOT NULL)
                                                 ),
                                             UNIQUE KEY unique_user_recipe_step (user_id, spoonacular_recipe_id, user_recipe_id, family_recipe_id, step_number)
);

-- Table 11: recipe_preparation_steps
CREATE TABLE recipe_preparation_steps (
                                          step_id INT AUTO_INCREMENT PRIMARY KEY,
                                          user_recipe_id INT,
                                          family_recipe_id INT,
                                          step_number INT NOT NULL,
                                          step_description TEXT NOT NULL,
                                          FOREIGN KEY (user_recipe_id) REFERENCES user_recipes(recipe_id) ON DELETE CASCADE,
                                          FOREIGN KEY (family_recipe_id) REFERENCES family_recipes(recipe_id) ON DELETE CASCADE,
                                          CONSTRAINT chk_single_recipe_type_steps CHECK (
                                              (user_recipe_id IS NOT NULL AND family_recipe_id IS NULL) OR
                                              (user_recipe_id IS NULL AND family_recipe_id IS NOT NULL)
                                              )
);
