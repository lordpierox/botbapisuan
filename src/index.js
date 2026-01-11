const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const WebServer = require('./web/server');
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

// Inizializza array globali SENZA ArrayList
if (!global.snipe) global.snipe = [];
if (!global.snipe_user) global.snipe_user = [];
if (!global.snipe_bot) global.snipe_bot = [];
if (!global.snipe_bot_user) global.snipe_bot_user = [];

// ========================================
// INICIAR SERVIDOR WEB CON CLIENTE (para Koyeb health checks)
// ========================================
const webServer = new WebServer(8080, client);
webServer.start();
console.log('✅ Servidor web iniciado ANTES de Discord');

// ========================================
// LUEGO INICIAR BOT DE DISCORD
// ========================================
const functions = fs.readdirSync("./src/functions").filter(file => file.endsWith(".js"));
const eventFiles = fs.readdirSync("./src/events").filter(file => file.endsWith(".js"));
const commandFolders = fs.readdirSync("./src/commands");

(async () => {
    for (const file of functions) {
        require(`./functions/${file}`)(client);
    }

    client.handleEvents(eventFiles, "./src/events");
    client.handleCommands(commandFolders, "./src/commands");

    // Login con token
    await client.login(process.env.token);
    
    console.log('🤖 Bot de Discord conectado correctamente');
})();
