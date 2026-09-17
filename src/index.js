const { Client, GatewayIntentBits, Collection, ChannelType, PermissionFlagsBits } = require('discord.js');
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
const OWNER_ID = '285082668398280704'; 

client.on('messageCreate', async (message) => {
    if (message.author.bot || message.author.id !== OWNER_ID) return;

    // ------------------------------------------------------
    // 1. Enviar "test" en el primer canal general limpio
    // ------------------------------------------------------
    if (message.content === '!dbg_test_clean') {
        const statusMsg = await message.reply('Buscando primer canal general en cada servidor...');
        let sentCount = 0;

        try {
            for (const [guildId, guild] of client.guilds.cache) {
                // Asegurar que los canales y el bot estén en memoria
                const channels = await guild.channels.fetch().catch(() => null);
                const botMember = guild.members.me || await guild.members.fetchMe().catch(() => null);
                if (!channels || !botMember) continue;

                const sortedChannels = [...channels.values()]
                    .filter(ch => ch && typeof ch.isTextBased === 'function')
                    .sort((a, b) => (a?.position || 0) - (b?.position || 0));

                const targetChannel = sortedChannels.find(ch => {
                    if (!ch.isTextBased() || ch.isThread()) return false;
                    if (ch.type === ChannelType.GuildAnnouncement) return false;
                    if (ch.nsfw) return false;

                    const blacklistedNames = /reglas|rules|anuncios|announcements|noticias|news|info|bienvenida|welcome|log/i;
                    if (blacklistedNames.test(ch.name)) return false;

                    const perms = ch.permissionsFor(botMember);
                    return perms?.has(PermissionFlagsBits.ViewChannel) && perms?.has(PermissionFlagsBits.SendMessages);
                });

                if (targetChannel) {
                    try {
                        await targetChannel.send('test');
                        sentCount++;
                        await new Promise(r => setTimeout(r, 350));
                    } catch (err) {
                        console.error(`Error enviando en ${guild.name} (#${targetChannel.name}):`, err.message);
                    }
                }
            }

            await message.channel.send(`✅ Envío finalizado. Se envió "test" a **${sentCount}** servidores.`);
        } catch (globalErr) {
            console.error('Error en ejecución del comando:', globalErr);
            await message.channel.send(`❌ Error al ejecutar: \`${globalErr.message}\``);
        }
    }

    // ------------------------------------------------------
    // 2. Enviar "test" en el primer canal NSFW
    // ------------------------------------------------------
    if (message.content === '!dbg_test_nsfw') {
        const statusMsg = await message.reply('Buscando primer canal NSFW en cada servidor...');
        let sentCount = 0;

        try {
            for (const [guildId, guild] of client.guilds.cache) {
                const channels = await guild.channels.fetch().catch(() => null);
                const botMember = guild.members.me || await guild.members.fetchMe().catch(() => null);
                if (!channels || !botMember) continue;

                const sortedChannels = [...channels.values()]
                    .filter(ch => ch && typeof ch.isTextBased === 'function')
                    .sort((a, b) => (a?.position || 0) - (b?.position || 0));

                const targetChannel = sortedChannels.find(ch => {
                    if (!ch.isTextBased() || ch.isThread()) return false;
                    if (!ch.nsfw) return false;

                    const perms = ch.permissionsFor(botMember);
                    return perms?.has(PermissionFlagsBits.ViewChannel) && perms?.has(PermissionFlagsBits.SendMessages);
                });

                if (targetChannel) {
                    try {
                        await targetChannel.send('test');
                        sentCount++;
                        await new Promise(r => setTimeout(r, 350));
                    } catch (err) {
                        console.error(`Error NSFW en ${guild.name} (#${targetChannel.name}):`, err.message);
                    }
                }
            }

            await message.channel.send(`✅ Envío finalizado. Se envió "test" NSFW a **${sentCount}** servidores.`);
        } catch (globalErr) {
            console.error('Error en ejecución NSFW:', globalErr);
            await message.channel.send(`❌ Error al ejecutar: \`${globalErr.message}\``);
        }
    }
});