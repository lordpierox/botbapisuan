const axios = require('axios');

let HttpsProxyAgent;
try {
    HttpsProxyAgent = require('https-proxy-agent').HttpsProxyAgent;
} catch (e) {
    // Prosegue in modalità diretta se https-proxy-agent non è ancora installato
}

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

        if (apiKey && userId) {
            params.api_key = apiKey;
            params.user_id = userId;
        }

        const axiosConfig = {
            params,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                'Accept': 'application/json, text/javascript, */*; q=0.01'
            },
            timeout: 15000
        };

        // Inoltra la richiesta a easyproxy se installato per uscire con IP WARP pulito
        if (HttpsProxyAgent) {
            axiosConfig.httpsAgent = new HttpsProxyAgent('http://172.17.0.1:7860');
        }

        const response = await axios.get('https://gelbooru.com/index.php', axiosConfig);

        if (response.data && Array.isArray(response.data.post)) {
            return response.data.post;
        } else if (Array.isArray(response.data)) {
            return response.data;
        }

        return [];
    } catch (error) {
        console.error('Gelbooru API Error:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
        }
        return [];
    }
}

module.exports = { searchGelbooru };