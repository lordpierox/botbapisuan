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
            console.error('❌ CLIENT_ID no está configurado en .env');
            return;
        }

        const rest = new REST({ version: '9' }).setToken(process.env.token);

        try {
            console.log('Started refreshing application (/) commands.');

            await rest.put(
                Routes.applicationCommands(clientId),
                { body: client.commandArray }
            );

            console.log('✅ Successfully reloaded application (/) commands.');
        } catch (error) {
            console.error('❌ Error registrando comandos:', error);
            // No lanzar error para que el bot siga funcionando
        }
    };
};
