const axios = require('axios');

/**
 * Cerca immagini su Gelbooru con autenticazione
 * @param {string} tags - Tags separati da spazi
 * @param {number} limit - Numero massimo di risultati
 * @returns {Promise<Array>} Array di post Gelbooru
 */
async function searchGelbooru(tags, limit = 50) {
    const url = 'https://gelbooru.com/index.php';
    
    const params = {
        page: 'dapi',
        s: 'post',
        q: 'index',
        json: 1,
        tags: tags,
        limit: limit,
        api_key: process.env.GELBOORU_API_KEY,
        user_id: process.env.GELBOORU_USER_ID
    };
    
    try {
        const response = await axios.get(url, { 
            params, 
            timeout: 10000 
        });
        return response.data.post || [];
    } catch (error) {
        console.error('Gelbooru API Error:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
        return [];
    }
}

module.exports = { searchGelbooru };
