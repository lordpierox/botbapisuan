const axios = require('axios');

async function searchGelbooru(tags, limit = 50) {
    try {
        const apiKey = process.env.GELBOORU_API_KEY;
        const userId = process.env.GELBOORU_USER_ID;
        // Lee el token desde el entorno o usa una clave directa
        const proxySecret = process.env.PROXY_SECRET || 'Ugotto1821';

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

        // Llamada a través de tu Cloudflare Worker con token de seguridad
        const response = await axios.get('https://gelproxy.deraktsu.com/index.php', {
            params,
            headers: {
                'Accept': 'application/json, text/javascript, */*; q=0.01',
                'x-proxy-token': proxySecret
            },
            timeout: 15000
        });

        if (response.data && Array.isArray(response.data.post)) {
            return response.data.post;
        } else if (Array.isArray(response.data)) {
            return response.data;
        }

        return [];
    } catch (error) {
        console.error('Error en el Proxy de Gelbooru:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
        return [];
    }
}

module.exports = { searchGelbooru };