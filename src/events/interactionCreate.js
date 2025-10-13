module.exports = {
    name: 'interactionCreate',
    
    async execute(interaction, client) {
        const date = new Date().toJSON();
        console.log(`(${interaction.user.username}) ha usato (${interaction.commandName}) alle (${date}).`);
        
        if (!interaction.isChatInputCommand()) return;
        
        const command = client.commands.get(interaction.commandName);
        
        if (!command) return;
        
        try {
            await command.execute(interaction, client);
        } catch (error) {
            console.error('NOOOOOOO el gato pateo el modem:', error);
            
            const errorMessage = {
                content: 'En efecto, el gato pateo el modem .',
                flags: 64 // ephemeral
            };
            
            try {
                if (interaction.deferred) {
                    await interaction.editReply(errorMessage);
                } else if (interaction.replied) {
                    await interaction.followUp(errorMessage);
                } else {
                    await interaction.reply(errorMessage);
                }
            } catch (replyError) {
                console.error('Estan hackeando mi head:', replyError.message);
            }
        }
    },
};
