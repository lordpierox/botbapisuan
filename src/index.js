const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const WebServer = require('./web/server');
require('dotenv').config();

console.log('\n\n========== INICIANDO BOT ==========\n');

// Verificar que el TOKEN existe
if (!process.env.token) {
    console.error('\n\u274c ERROR: No se encontró la variable de entorno "token"');
    console.error('\nAsegúrate de agregar en Koyeb las variables de entorno:');
    console.error('  token = tu_token_de_discord\n');
    process.exit(1);
}

// ========================================
// INICIAR SERVIDOR WEB PRIMERO (para health checks de Koyeb)
// ========================================
let webServer = null;
try {
    webServer = new WebServer(8080, null); // null inicialmente, se actualizará cuando el bot esté listo
    webServer.start();
    console.log('🌐 Servidor web iniciado en puerto 8080');
} catch (error) {
    console.error('❌ Error iniciando servidor web:', error.message);
    console.log('   Continuando solo con Discord bot...\n');
}

// ========================================
// CREAR CLIENTE DE DISCORD
// ========================================
const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent
    ] 
});

client.commands = new Collection();

// Inizializza array globali
if (!global.snipe) global.snipe = [];
if (!global.snipe_user) global.snipe_user = [];
if (!global.snipe_bot) global.snipe_bot = [];
if (!global.snipe_bot_user) global.snipe_bot_user = [];

const functions = fs.readdirSync("./src/functions").filter(file => file.endsWith(".js"));
const eventFiles = fs.readdirSync("./src/events").filter(file => file.endsWith(".js"));
const commandFolders = fs.readdirSync("./src/commands");

console.log(`\ud83d\udcda Cargando ${functions.length} funciones...`);
console.log(`\ud83d\udcda Cargando ${eventFiles.length} eventos...`);
console.log(`\ud83d\udcda Cargando ${commandFolders.length} carpetas de comandos...\n`);

(async () => {
    // Cargar funciones
    for (const file of functions) {
        require(`./functions/${file}`)(client);
    }

    // Cargar eventos y comandos
    client.handleEvents(eventFiles, "./src/events");
    client.handleCommands(commandFolders, "./src/commands");

    // CONECTAR A DISCORD
    console.log('\n\ud83d\udd0c Conectando a Discord...');
    try {
        await client.login(process.env.token);
        
        // Una vez conectado, actualizar el cliente en el WebServer
        if (webServer) {
            webServer.botClient = client;
            console.log('\n\u2705 WebServer actualizado con cliente Discord');
        }
    } catch (error) {
        console.error('\n\u274c ERROR al conectar a Discord:');
        console.error(error.message);
        process.exit(1);
    }
})();
