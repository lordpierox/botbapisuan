// ========================================
// CONSTANTES DE LA WEB - FÁCIL DE EDITAR
// ========================================

module.exports = {
    // Información general del bot
    BOT_NAME: 'SukiBaka Bot',
    BOT_VERSION: 'v1.0',
    BOT_TITLE: 'Suki el bot',
    
    // Textos de la barra de estado
    STATUS_BAR: {
        HOME: 'aqui escuchando pururin todo el dia dx',
        COMANDOS: 'Comandos totales: 8 | En desarrollo: 3',
        PLAN: '⚠️ DOCUMENTO SECRETO - NO COMPARTIR',
        PURURIN: '♪ Reproduciendo: Pururin - All Songs (Shuffle) ♪',
        AURORA: '🔒 Contenido bloqueado - Se requiere nivel de acceso superior'
    },
    
    // Rutas de archivos multimedia
    MEDIA: {
        BACKGROUND_XP: '/public/images/backgroundxp.png',
        PURU_VIDEO: '/public/videos/puruvideo.mp4',
        PURU_AUDIO: '/public/audio/puruaudio.mp3',
        MICHON_IMAGE: 'https://placehold.co/250x250/667eea/ffffff?text=Michon+dx',
        PURURIN_IMAGE: 'https://placehold.co/250x250/ff69b4/ffffff?text=Pururin'
    },
    
    // Colores del tema
    COLORS: {
        PRIMARY: '#667eea',
        SECONDARY: '#764ba2',
        ACCENT: '#ff69b4',
        TEXT_DARK: '#333',
        TEXT_LIGHT: '#666'
    },
    
    // Navegación
    NAV_ITEMS: [
        { name: 'Inicio', url: '/home', enabled: true },
        { name: 'Comandos', url: '/comandos', enabled: true },
        { name: 'El Plan', url: '/plan', enabled: true },
        { name: 'Pururin', url: '/pururin', enabled: true },
        { name: 'Aurora', url: '/aurora', enabled: false }
    ],
    
    // Textos personalizables
    TEXTS: {
        HOME_TITLE: 'Hola, soy Michon dx',
        HOME_PARAGRAPH_1: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.',
        HOME_PARAGRAPH_2: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
        HOME_PARAGRAPH_3: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.',
        HOME_PARAGRAPH_4: 'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt dx',
        
        PURURIN_TITLE: '🎵 Pururin - La Leyenda',
        PURURIN_PARAGRAPH_1: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        PURURIN_PARAGRAPH_2: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit dx'
    }
};
