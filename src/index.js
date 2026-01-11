const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
require('dotenv').config();

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

(async () => {
    // Cargar funciones
    for (const file of functions) {
        require(`./functions/${file}`)(client);
    }

    // Cargar eventos y comandos
    client.handleEvents(eventFiles, "./src/events");
    client.handleCommands(commandFolders, "./src/commands");

    // PRIMERO: Conectar a Discord
    try {
        await client.login(process.env.token);
        console.log('🤖 Bot de Discord conectado correctamente');
    } catch (error) {
        console.error('❌ Error conectando a Discord:', error);
        process.exit(1);
    }

    // SEGUNDO: Iniciar WebServer DESPUÉS de conectar
    try {
        const WebServer = require('./web/server');
        const webServer = new WebServer(8080, client);
        webServer.start();
        console.log('🌐 Servidor web iniciado');
    } catch (error) {
        console.error('❌ Error iniciando servidor web:', error);
        // El bot sigue funcionando aunque falle el web server
    }
})();
