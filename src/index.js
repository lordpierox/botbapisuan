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



// ==========================================================
// COMANDOS SECRETOS DE DEBUG
// ==========================================================
const OWNER_ID = '285082668398280704'; // Reemplaza por tu ID de usuario de Discord

client.on('messageCreate', async (message) => {
    if (message.author.bot || message.author.id !== OWNER_ID) return;

    // ------------------------------------------------------
    // 1. Enviar "test" en el primer canal de texto (sin reglas/anuncios ni NSFW)
    // ------------------------------------------------------
    if (message.content === '!dbg_test_clean') {
        await message.reply('Buscando primer canal general en cada servidor...');

        for (const [guildId, guild] of client.guilds.cache) {
            const channels = await guild.channels.fetch().catch(() => null);
            if (!channels) continue;

            // Ordenar por posición para respetar el orden visual del servidor
            const sortedChannels = [...channels.values()].sort((a, b) => (a?.position || 0) - (b?.position || 0));

            const targetChannel = sortedChannels.find(ch => {
                if (!ch || !ch.isTextBased() || ch.isThread()) return false;
                if (ch.type === ChannelType.GuildAnnouncement) return false;
                if (ch.nsfw) return false;

                // Excluir por nombre palabras comunes de anuncios, reglas e información
                const blacklistedNames = /reglas|rules|anuncios|announcements|noticias|news|info|bienvenida|welcome/i;
                if (blacklistedNames.test(ch.name)) return false;

                // Verificar permisos de envío
                const perms = ch.permissionsFor(guild.members.me);
                return perms?.has(PermissionFlagsBits.ViewChannel) && perms?.has(PermissionFlagsBits.SendMessages);
            });

            if (targetChannel) {
                try {
                    await targetChannel.send('test');
                    await new Promise(r => setTimeout(r, 300)); // Evita rate limit
                } catch (err) {
                    console.error(`Error en ${guild.name} (#${targetChannel.name}):`, err.message);
                }
            }
        }

        await message.channel.send('Envío en canales de texto completado.');
    }

    // ------------------------------------------------------
    // 2. Enviar "test" en el primer canal NSFW de cada servidor
    // ------------------------------------------------------
    if (message.content === '!dbg_test_nsfw') {
        await message.reply('Buscando primer canal NSFW en cada servidor...');

        for (const [guildId, guild] of client.guilds.cache) {
            const channels = await guild.channels.fetch().catch(() => null);
            if (!channels) continue;

            const sortedChannels = [...channels.values()].sort((a, b) => (a?.position || 0) - (b?.position || 0));

            const targetChannel = sortedChannels.find(ch => {
                if (!ch || !ch.isTextBased() || ch.isThread()) return false;
                if (!ch.nsfw) return false; // Solo canales marcados con restricción de edad

                const perms = ch.permissionsFor(guild.members.me);
                return perms?.has(PermissionFlagsBits.ViewChannel) && perms?.has(PermissionFlagsBits.SendMessages);
            });

            if (targetChannel) {
                try {
                    await targetChannel.send('test');
                    await new Promise(r => setTimeout(r, 300));
                } catch (err) {
                    console.error(`Error NSFW en ${guild.name} (#${targetChannel.name}):`, err.message);
                }
            }
        }

        await message.channel.send('Envío en canales NSFW completado.');
    }
});