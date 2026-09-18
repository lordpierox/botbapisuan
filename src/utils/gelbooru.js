const axios = require('axios');

async function searchGelbooru(tags, limit = 50) {
    try {
        const apiKey = process.env.GELBOORU_API_KEY;
        const userId = process.env.GELBOORU_USER_ID;

        const params = {
            page: 'dapi',
            s: 'post',
            q: 'index',
            json: 1,
            limit: limit,
            tags: tags.trim()
        };

        // Inietta credenziali solo se configurate
        if (apiKey && userId) {
            params.api_key = apiKey;
            params.user_id = userId;
        }

        const response = await axios.get('https://gelbooru.com/index.php', {
            params,
            headers: {
                // User-Agent realistico fondamentale per evitare il 429 di Nginx
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Accept': 'application/json, text/javascript, */*; q=0.01'
            },
            timeout: 10000
        });

        // Gelbooru restituisce i post all'interno dell'array post
        if (response.data && response.data.post) {
            return response.data.post;
        }

        return [];
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