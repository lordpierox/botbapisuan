const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const WebServer = require('./web/server');
require('dotenv').config();

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

const functions = fs.readdirSync("./src/functions").filter(file => file.endsWith(".js"));
const eventFiles = fs.readdirSync("./src/events").filter(file => file.endsWith(".js"));
const commandFolders = fs.readdirSync("./src/commands");

// Cargar funciones
for (const file of functions) {
    require(`./functions/${file}`)(client);
}

// Cargar eventos (sin await)
client.handleEvents(eventFiles, "./src/events");

// Iniciar WebServer ANTES de login
try {
    const webServer = new WebServer(8080, client);
    webServer.start();
    console.log('🌐 WebServer iniciado en puerto 8080');
} catch (error) {
    console.error('❌ Error iniciando WebServer:', error.message);
}

// Login
console.log('🔑 Intentando login a Discord...');
client.login(process.env.token)
    .then(() => {
        console.log('✅ Login exitoso');
        // Registrar comandos DESPUÉS del login
        setTimeout(() => {
            client.handleCommands(commandFolders, "./src/commands");
        }, 2000);
    })
    .catch(error => {
        console.error('❌ Error en login:', error.message);
    });
