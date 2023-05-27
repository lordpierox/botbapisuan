const { SlashCommandBuilder } = require('@discordjs/builders')
const { EmbedBuilder, Client, PermissionsBitField} = require('discord.js')

module.exports = {
    data:new SlashCommandBuilder()
    .setName('invite')
    .setDescription('i will repeat your text! | this is an example command'),
	async execute(interaction, client, message) {

		
		await client.guilds.cache.forEach(guild => {
            var invite = interaction.guild.invites.create(interaction.channel,{maxAge: 0}).then((invite) => console.log("https://discord.gg/"+invite.code+"  "))
            
            //console.log(`${guild.name} | ${guild.id}`);
          })  

		await interaction.reply({ content: 'Mensaje enviado!', ephemeral: false });

	
	},
};