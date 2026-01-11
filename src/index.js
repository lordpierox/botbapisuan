const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
require('dotenv').config();

console.log('\n\n========== INICIANDO BOT ==========\n');

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

console.log(`📚 Cargando ${functions.length} funciones...`);
console.log(`📚 Cargando ${eventFiles.length} eventos...`);
console.log(`📚 Cargando ${commandFolders.length} carpetas de comandos...\n`);

(async () => {
    // Cargar funciones
    for (const file of functions) {
        require(`./functions/${file}`)(client);
    }

    // Cargar eventos y comandos
    client.handleEvents(eventFiles, "./src/events");
    client.handleCommands(commandFolders, "./src/commands");

    // CONECTAR A DISCORD
    console.log('\n🔌 Conectando a Discord...\n');
    await client.login(process.env.token);
})();
