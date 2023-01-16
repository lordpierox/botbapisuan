const { SlashCommandBuilder } = require('@discordjs/builders')
const { EmbedBuilder, Client, PermissionsBitField} = require('discord.js')

module.exports = {
    data:new SlashCommandBuilder()
    .setName('say')
    .setDescription('i will repeat your text! | this is an example command')
		.addStringOption(option =>
			option.setName('string')
				  .setDescription('what do you want me to say?')
				  .setRequired(true)
				  .setMaxLength(2000))
		.addChannelOption(option =>
			option.setName('channel')
			   	  .setDescription('which channel to send it in?')),
	async execute(interaction, client, message) {


		



		const string = interaction.options.getString('string');
		if (await interaction.options.getChannel('channel') == null){
			//const channel = await client.channels.cache.get();
			//await channel.send(string);
			const channel = await interaction.channel;
			await interaction.reply({ content: 'Mensaje enviado!', ephemeral: true });
			await channel.send(string);

			return;
		}

		
		const channel1 = await interaction.options.getChannel('channel');
		const guild = await client.guilds.cache.get(interaction.guildId);
      	const member = await guild.members.cache.get(interaction.user.id);
      if(member.permissionsIn(channel1.id).has("SendMessages")){
        const channel = await client.channels.cache.get(channel1.id);
		
    	await channel.send(string);

		await interaction.reply({ content: 'Mensaje enviado!', ephemeral: true });
	}else{
		await interaction.reply({ content: 'No puedes escribir en ese canal!', ephemeral: true });
	}
		
		
	
	},
};