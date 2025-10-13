const { EmbedBuilder } = require('discord.js');

// Funzioni costruttore per snipe
function Snipeado(chan, user, cont, url, date) {
    this.chan = chan;
    this.user = user;
    this.cont = cont;
    this.url = url;
    this.date = date;
}

function SnipeadoBot(chan, user, cont, url, date, embed) {
    this.chan = chan;
    this.user = user;
    this.cont = cont;
    this.url = url;
    this.date = date;
    this.embed = embed;
}

module.exports = {
    name: 'messageDelete',
    on: true,
    async execute(client, message) {
        try {
            let imgurl;
            let is_a_bot = false;

            try {
                if (client.channel?.type === 'DM') return;
                if (client.author?.bot) {
                    is_a_bot = true;
                }
            } catch (error) {
                console.log(error);
            }

            try {
                const attachment = client.attachments?.first();
                if (attachment?.contentType === 'image/jpeg' || 
                    attachment?.contentType === 'image/png') {
                    imgurl = attachment.url;
                }
            } catch (error) {
                // Nessun attachment
            }

            let content = client.content || ' ';

            if (is_a_bot) {
                console.log("DELETED BOT! User: " + client.author.username + ", Message: " + content);
                
                global.snipe_bot.push(new SnipeadoBot(
                    client.channel.id,
                    client.author.id,
                    content,
                    imgurl,
                    client.createdTimestamp,
                    client.embeds
                ));
                
                // Mantieni solo gli ultimi 50 messaggi bot
                if (global.snipe_bot.length > 50) {
                    global.snipe_bot.shift();
                }
            } else {
                console.log("DELETED! User: " + client.author.username + ", Message: " + content);
                
                global.snipe.push(new Snipeado(
                    client.channel.id,
                    client.author.id,
                    content,
                    imgurl,
                    client.createdTimestamp
                ));
                
                // Mantieni solo gli ultimi 50 messaggi
                if (global.snipe.length > 50) {
                    global.snipe.shift();
                }
            }

        } catch (error) {
            console.log(error);
        }
    },
};
