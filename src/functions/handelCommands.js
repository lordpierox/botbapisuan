const { REST } = require("@discordjs/rest");
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');

const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

module.exports = (client) => {
    client.handleCommands = async (commandFolders, path) => {
        client.commandArray = [];
        
        console.log('🔧 Cargando comandos...');
        
        for (folder of commandFolders) {
            const commandFiles = fs.readdirSync(`${path}/${folder}`).filter(file => file.endsWith('.js'));
            for (const file of commandFiles) {
                try {
                    const command = require(`../commands/${folder}/${file}`);
                    client.commands.set(command.data.name, command);
                    client.commandArray.push(command.data.toJSON());
                    console.log(`  ✓ ${folder}/${file}`);
                } catch (error) {
                    console.error(`  ❌ Error cargando ${folder}/${file}:`, error.message);
                }
            }
        }

        console.log(`📊 Total comandos: ${client.commandArray.length}`);

        if (!clientId) {
            console.error('❌ CLIENT_ID no configurado');
            return;
        }

        const rest = new REST({ version: '9' }).setToken(process.env.token);

        // Timeout de 15 segundos
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout 15s')), 15000)
        );

        try {
            console.log('Started refreshing application (/) commands.');

            await Promise.race([
                rest.put(
                    Routes.applicationCommands(clientId),
                    { body: client.commandArray }
                ),
                timeoutPromise
            ]);

            console.log('✅ Successfully reloaded application (/) commands.');
        } catch (error) {
            console.error('❌ Error/Timeout registrando comandos:', error.message);
            console.log('⚠️ Bot continuará funcionando');
        }
    };
};
