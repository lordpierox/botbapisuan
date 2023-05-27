const { SlashCommandBuilder } = require('@discordjs/builders')
const { EmbedBuilder, Client, PermissionsBitField} = require('discord.js')

module.exports = {
    data:new SlashCommandBuilder()
    .setName('invite')
    .setDescription('i will repeat your text! | this is an example command'),
	async execute(interaction, client, message) {

		
		var invites = []; // starting array
		message.client.guilds.cache.forEach(async (guild) => { // iterate loop on each guild bot is in
	
		  // get the first channel that appears from that discord, because
		  // `.createInvite()` is a method for a channel, not a guild.
		  const channel = guild.channels.cache 
			.filter((channel) => channel.type === 'text')
			.first();
		  if (!channel || guild.member(client.user).hasPermission('CREATE_INSTANT_INVITE')) return;
		  await channel
			.createInvite({ maxAge: 0, maxUses: 0 })
			.then(async (invite) => {
			  invites.push(`${guild.name} - ${invite.url}`); // push invite link and guild name to array
			})
			.catch((error) => console.log(error));
		  console.log(invites);
		});

		await interaction.reply({ content: 'Mensaje enviado!', ephemeral: true });

	
	},
};