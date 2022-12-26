const { SlashCommandBuilder } = require('@discordjs/builders')
const { EmbedBuilder, Client} = require('discord.js')

module.exports = {
    data:new SlashCommandBuilder()
    .setName('say')
    .setDescription('Envia un texto')
		.addStringOption(option =>
			option.setName('string')
				  .setDescription('Que quieres que escriba?')
				  .setRequired(true)
				  .setMaxLength(2000))
		.addChannelOption(option =>
			option.setName('channel')
			   	  .setDescription('Selecciona un canal (opcional)')),
	async execute(interaction, client, message) {
		const string = interaction.options.getString('string');
		if (await interaction.options.getChannel('channel') == null){
			//const channel = await client.channels.cache.get();
			//await channel.send(string);
			await interaction.reply({ content: 'Mensaje enviado!', ephemeral: true });
			await interaction.followUp(string);
			return;
		}

		
		const channel1 = await interaction.options.getChannel('channel');
		
		const channel = await client.channels.cache.get(channel1.id);
		
    	await channel.send(string);

		await interaction.reply({ content: 'Mensaje enviado!', ephemeral: true });
	
	},
};