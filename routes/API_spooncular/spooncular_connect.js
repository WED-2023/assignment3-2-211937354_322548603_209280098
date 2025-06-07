const axios = require("axios"); // Used to perform HTTP GET requests
const api_domain = "https://api.spoonacular.com/recipes"; // Base domain of the Spoonacular API
const API_KEY = process.env.SPOONACULAR_API_KEY; // API key loaded from .env file


/**
 * Perform a GET request to Spoonacular API with provided endpoint and parameters
 * @param {string} endpoint - the endpoint path (e.g., '/random' or '/12345/information')
 * @param {object} params - additional query parameters to pass to the API
 * @returns {Promise<object>} - the parsed JSON response from Spoonacular
 */
async function getFromSpoonacular(endpoint, params = {}) {
    params.apiKey = API_KEY; // Add the API key to the request
    const url = `${api_domain}${endpoint}`; // Build full URL
    const response = await axios.get(url, { params }); // Perform HTTP GET request
    return response.data; // Return the response body
}

module.exports = {
    getFromSpoonacular
};
