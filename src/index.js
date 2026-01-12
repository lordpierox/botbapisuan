const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
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

console.log('🔧 Cargando funciones...');
for (const file of functions) {
    require(`./functions/${file}`)(client);
    console.log(`  ✓ ${file}`);
}

console.log('📡 Registrando eventos...');
client.handleEvents(eventFiles, "./src/events");

// Verificar que el token existe
if (!process.env.token) {
    console.error('❌❌❌ TOKEN NO CONFIGURADO EN .env ❌❌❌');
    process.exit(1);
}

console.log('🔑 Intentando login a Discord...');
console.log(`   Token: ${process.env.token.substring(0, 20)}...`);

// Timeout de 30 segundos para el login
const loginTimeout = setTimeout(() => {
    console.error('❌❌❌ LOGIN TIMEOUT - Discord no responde después de 30s ❌❌❌');
    console.error('   Posibles causas:');
    console.error('   1. Token inválido o expirado');
    console.error('   2. Discord API caído');
    console.error('   3. Problema de red en Koyeb');
    process.exit(1);
}, 30000);

client.login(process.env.token)
    .then(() => {
        clearTimeout(loginTimeout);
        console.log('✅ Login promise resolved');
    })
    .catch(error => {
        clearTimeout(loginTimeout);
        console.error('❌ Login falló:', error.message);
        process.exit(1);
    });

console.log('⏳ Esperando conexión a Discord...');

// Registrar comandos DESPUÉS (no bloquea)
setTimeout(() => {
    console.log('🔧 Iniciando registro de comandos...');
    client.handleCommands(commandFolders, "./src/commands");
}, 5000);
