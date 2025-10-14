const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('act')
        .setDescription('Comandos de acciones (basados en Evangelion)')
        
        // Subcommand: angry
        .addSubcommand(subcommand =>
            subcommand
                .setName('angry')
                .setDescription('Muestra enfado')
                .addUserOption(option => option
                    .setName('user')
                    .setDescription('Seleccionar un usuario')
                    .setRequired(false)))
        
        // Subcommand: bang
        .addSubcommand(subcommand =>
            subcommand
                .setName('bang')
                .setDescription('Disparo!')
                .addUserOption(option => option
                    .setName('user')
                    .setDescription('Seleccionar un usuario')
                    .setRequired(false)))
        
        // Subcommand: bite
        .addSubcommand(subcommand =>
            subcommand
                .setName('bite')
                .setDescription('Morder a alguien')
                .addUserOption(option => option
                    .setName('user')
                    .setDescription('Seleccionar un usuario')
                    .setRequired(true)))
        
        // Subcommand: blush
        .addSubcommand(subcommand =>
            subcommand
                .setName('blush')
                .setDescription('Sonrojarse'))
        
        // Subcommand: claps
        .addSubcommand(subcommand =>
            subcommand
                .setName('claps')
                .setDescription('Applaudi qualcuno')
                .addUserOption(option => option
                    .setName('user')
                    .setDescription('Seleccionar un usuario')
                    .setRequired(true)))
        
        // Subcommand: confused
        .addSubcommand(subcommand =>
            subcommand
                .setName('confused')
                .setDescription('Mostrar confusión'))
        
        // Subcommand: dance
        .addSubcommand(subcommand =>
            subcommand
                .setName('dance')
                .setDescription('Ballar!'))
        
        // Subcommand: eating
        .addSubcommand(subcommand =>
            subcommand
                .setName('eating')
                .setDescription('Comer'))
        
        // Subcommand: hug
        .addSubcommand(subcommand =>
            subcommand
                .setName('hug')
                .setDescription('Abraza a alguien')
                .addUserOption(option => option
                    .setName('user')
                    .setDescription('Seleccionar un usuario')
                    .setRequired(true)))
        
        // Subcommand: kiss
        .addSubcommand(subcommand =>
            subcommand
                .setName('kiss')
                .setDescription('Besar a alguien')
                .addUserOption(option => option
                    .setName('user')
                    .setDescription('Seleccionar un usuario')
                    .setRequired(true))),

    async execute(interaction, client) {
        await interaction.deferReply();

        // Ottieni il subcommand usato
        const subcommand = interaction.options.getSubcommand();
        const targetUser = interaction.options.getUser('user');

        // INSERISCI QUI IL TUO const gifs = { ... }
        const gifs = {
    angry: [
        "https://media.tenor.com/Y2NwuJ_RuZIAAAAC/shinji-ikari-shinji.gif",
        "https://media.tenor.com/OadWktdQXl0AAAAC/evangelion-angry.gif",
        "https://media.tenor.com/-Ok1XvetIQUAAAAC/moscato-neon.gif",
        "https://media.tenor.com/M2XAANtkNeoAAAAC/asuka-evangelion.gif",
        "https://media.tenor.com/O8w4yYKhWCIAAAAC/anime.gif",
        "https://media.tenor.com/7kT6AAw-K3wAAAAC/evangelion-misato.gif",
        "https://media.tenor.com/yngIrwQj2MsAAAAC/anime-rage.gif",
        "https://media.tenor.com/L2ppqCMg99kAAAAC/mari-makinami-illustrious-mari.gif",
        "https://media.tenor.com/UPqNQPMCEOQAAAAC/evangelion-asuka.gif",
        "https://media.tenor.com/sOTfKpxJQOoAAAAC/misato-evangelion.gif",
        "https://media.tenor.com/rquDMbEaRCsAAAAS/asuka-angry.gif",
        "https://media.tenor.com/7S638lh4XAUAAAAC/oltokun-otto.gif",
        "https://media.tenor.com/xlsipJ5o_2kAAAAC/on-my-nerves-neon-genesis-evangelion.gif",
        "https://media.tenor.com/tqo9zwSxJRkAAAAC/neon-genesis-evangelion-evangelion.gif",
        "https://64.media.tumblr.com/57c366b62a42842b48dc288ac1b1e44e/tumblr_ptr8s8Br6i1xkr0iao1_540.gif",
        "https://media.tenor.com/s6uhUeJMgCAAAAAC/asuka-asuka-langley.gif",
        "https://media.tenor.com/HvUawMRmLHkAAAAC/kill-asuka.gif",
        "https://giffiles.alphacoders.com/112/112079.gif",
        "https://64.media.tumblr.com/5a60e7665ea22814ebe591d1d5543065/tumblr_mnbsvuWMvr1qjhmoto1_500.gif",
        "https://64.media.tumblr.com/fa9126cef8d52a8e41c43cc598a48239/801cac7ecbd174c3-c4/s540x810/b52520b095a0e488a3fdd25a1fc2b0f54a12c286.gif",
        "https://media.tenor.com/GYD_DkhKadkAAAAC/asuka.gif"
    ],
    
    bang: [
        "https://64.media.tumblr.com/93b3e19a29d61666b131a75016e723c7/tumblr_pgvgpydRfS1vhuamt_500.gifv",
        "https://i.gifer.com/origin/1a/1a1599bca19aada796863bd0cbdc480a.gif",
        "https://thumbs.gfycat.com/DismalVariableGermanshepherd-size_restricted.gif",
        "https://64.media.tumblr.com/332a7dd09db2c7072afa48104db6b521/bfc90afc440ce526-d7/s640x960/d0aeecf80fbfaaf5bc9d89b7021abceddd245285.gif",
        "https://64.media.tumblr.com/9cf679774c28343c49097c284da930d1/tumblr_o9d222IOYM1qjz3kqo1_500.gif",
        "https://gfycat.com/grouchygeneralhyrax",
        "https://i.kym-cdn.com/photos/images/newsfeed/000/706/248/6f8.gif",
        "https://media.tenor.com/l01RAcRu6igAAAAC/nge-neon-genesis-evangelion.gif",
        "https://i.pinimg.com/originals/36/b2/53/36b253ba0a8caa4beca27e807fbe2ae2.gif",
        "https://media.tenor.com/jTn44nuiZDcAAAAC/evangelion-rebuild.gif",
        "https://media.tenor.com/MU-RLMMHPHMAAAAC/misato-katsuragi-reload.gif"
    ],
    
    bite: [
        "https://68.media.tumblr.com/2e8c7a5ed5c9b79f244881a5a0c0ef0d/tumblr_o0t4wfzRd01v39f3co1_500.gif",
        "https://64.media.tumblr.com/e69d4a9b89ca5a3c5adbfd520ed6bc21/9d321703d3c16096-a5/s500x750/5e670fee7ca2b0e98627776a6aa73ff0e9c727f8.gif",
        "https://media.tenor.com/KNFoNwqzJj0AAAAC/evangelion-rebuild-of-evangelion.gif",
        "https://64.media.tumblr.com/3474f4b3f108bf7a5d74418dc9b1bfdd/tumblr_mt1nb4wR2e1rey868o1_500.gif"
    ],
    
    blush: [
        "https://i.pinimg.com/originals/e8/7c/88/e87c887e660a492565cc06fd89cc7ce4.gif",
        "https://media.tenor.com/57ykwUGXE08AAAAC/blush-shinji.gif",
        "https://media.tenor.com/hwZEAai1BgsAAAAd/asuka-asuka-langley.gif",
        "https://i.pinimg.com/originals/06/92/2d/06922d5fc663c338c260378fb73affc5.gif",
        "https://i.kym-cdn.com/photos/images/original/001/127/013/562.gif",
        "https://pa1.narvii.com/7517/71f5a324c8c7c9d34137471bd370ba9e252c5b33r1-500-281_hq.gif"
    ],
    
    claps: [
        "https://media.tenor.com/DN4JBeneqdkAAAAM/congratulations-evangelion.gif",
        "https://media.tenor.com/Agw6xn9qKV8AAAAC/asuka-evangelion.gif",
        "https://media.tenor.com/b1nqguJIuf8AAAAC/evangelion-clapping.gif",
        "https://imgur.com/bnBBYyz"
    ],
    
    confused: [
        "https://i.gifer.com/DV6.gif",
        "https://media3.giphy.com/media/ydyZ0KaHpiyGI/giphy.gif?cid=790b761179dbb89bc19c22fc41d350b06547c3b3a64c1c87&rid=giphy.gif&ct=g",
        "https://images.squarespace-cdn.com/content/v1/5bae09a3755be22d4d83355a/1623800205676-1Z67XAT6RPA9GIRO8RBE/public.gif",
        "https://64.media.tumblr.com/bdb8af6c3195112a9878212d656536a2/8bf7fc16bd26eff8-60/s540x810/99e2edbace039ff1c1c25d7e71a7a7915df3cd09.gif",
        "https://64.media.tumblr.com/0cce46e13ffffed5ecb0a20aeda900c6/tumblr_o2abgxG5zC1v39f3co1_500.gif",
        "https://giffiles.alphacoders.com/112/112004.gif",
        "https://otakuorbit.com/wp-content/uploads/2018/06/tumblr_n0j6nvw0pk1s62xp3o1_500.gif"
    ],
    
    dance: [
        "https://media.tenor.com/msUe1bigvaEAAAAC/evangelion-shinji-ikari.gif",
        "https://media.tenor.com/kZo8jyxABlYAAAAC/evangelion-dancing.gif",
        "https://media.tenor.com/5hrI54nrHqMAAAAd/neon-genesis-evangelion-shinji-ikari.gif",
        "https://gfycat.com/cheerfulinfamouslabradorretriever-evangelion",
        "https://64.media.tumblr.com/ded0c27483f6970240e6fa944f78acaa/tumblr_inline_p912ofCloB1qkpgz6_500.gifv",
        "https://media.tenor.com/FgGlem7vDJMAAAAd/evangelion-pubg.gif",
        "https://media.tenor.com/H-Hm-zXBRxUAAAAM/pubg-pubg-mobile.gif",
        "https://imgflip.com/gif/1fm55e",
        "https://media.tenor.com/-iQRugZFJt0AAAAd/evangelion-neon-genesis-evangelion.gif",
        "https://media.tenor.com/y6M-MOCmj4MAAAAC/get-real-rei-ayanami.gif",
        "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/f3c90f76-a724-4466-b662-cb7ec7d9c2b3/d4wggn6-339d3573-538d-4efc-a316-f3223f7eb5e7.gif?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcL2YzYzkwZjc2LWE3MjQtNDQ2Ni1iNjYyLWNiN2VjN2Q5YzJiM1wvZDR3Z2duNi0zMzlkMzU3My01MzhkLTRlZmMtYTMxNi1mMzIyM2Y3ZWI1ZTcuZ2lmIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.QFOV6I3NliadpKlMwcIYm7eF5xnTEroHtJSyX8lBXPU",
        "https://media.tenor.com/7WRxkembPzcAAAAC/misato-evangelion.gif",
        "https://media.tenor.com/CY5gvldryLcAAAAd/neon-genesis-evangelion-rei.gif"
    ],
    
    eating: [
        "https://thumbs.gfycat.com/DependentLightAvocet-max-1mb.gif",
        "https://64.media.tumblr.com/f3ce24502dfecf64d8c5361306cf5ac3/tumblr_p4tbeyLc2s1vm1a59o1_540.gif",
        "https://media.tenor.com/L2FMFj3pQ4kAAAAS/misato-misato-katsuragi.gif",
        "https://img.gifmagazine.net/gifmagazine/images/20101/original.gif",
        "https://image.myanimelist.net/ui/BQM6jEZ-UJLgGUuvrNkYUNwLpdhh9mfbwIBB6D1G23zbgms14yy29V5DwtovjcUbbuZmq6la8rwdXQ2f0qTgJA",
        "https://giffiles.alphacoders.com/112/112469.gif",
        "https://64.media.tumblr.com/3feb45c73a5754851fe205363f26d49c/tumblr_mzcftyjOFS1qmjkvvo1_500.gif",
        "https://64.media.tumblr.com/3334dcb27d3b1cc38657ea4ac27439a2/tumblr_mjfj2thpor1rec90to1_500.gif",
        "https://giffiles.alphacoders.com/112/112440.gif",
        "https://thumbs.gfycat.com/OrangeSimilarAchillestang-size_restricted.gif",
        "https://64.media.tumblr.com/245ebfe9ed91870c65a158bcfc6d2c81/tumblr_oix6w12o2S1vart62o1_r9_500.gifv"
    ],
    
    hug: [
        "https://media.tenor.com/6JWa6o9OPUYAAAAC/evangelion-ritsuko.gif",
        "https://64.media.tumblr.com/26839740ac3c4f46d1e690c5ac8eab45/9443e9f0cf049bc9-97/s540x810/cb85a038597a612e0fe6b0759b2c070a9472824b.gif"
    ],
    
    kiss: [
        "https://media.tenor.com/aGLziaDp4hYAAAAC/asuka-shinji.gif",
        "https://24.media.tumblr.com/eef9fe10e86372fd1e53d747382a3719/tumblr_mmhm8oZl7N1s645eto1_500.gif",
        "https://i.pinimg.com/originals/4d/57/dd/4d57ddcd53675e89ca39fd06356f3042.gif",
        "https://media.tenor.com/MHKrns3xfzgAAAAC/shinji-misato.gif",
        "https://media.tenor.com/zXLSCFCE-fAAAAAd/kiss.gif",
        "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/edf63ba9-c4c7-4835-bc98-10dd23f4a17c/dc82maf-75f45d2d-91ff-4dd7-8d89-25fc276d8c1b.gif?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcL2VkZjYzYmE5LWM0YzctNDgzNS1iYzk4LTEwZGQyM2Y0YTE3Y1wvZGM4Mm1hZi03NWY0NWQyZC05MWZmLTRkZDctOGQ4OS0yNWZjMjc2ZDhjMWIuZ2lmIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.zQK1sozljRR3LQXu27wEIetuiwWsH8OzHmO3oeWSADM"
    ]
};


        // Scegli una GIF random per il subcommando
        const gifArray = gifs[subcommand] || [];
        const randomGif = gifArray[Math.floor(Math.random() * gifArray.length)];

        // Logica messaggi per ogni subcommand (ESATTAMENTE come i file originali)
        let message = '';

        if (subcommand === 'angry') {
            // Da angry.js
            if (targetUser) {
                message = `${interaction.user.username} quiere desatar su ira contra ${targetUser.username}!`;
                if (interaction.user.username === targetUser.username) {
                    message = `${interaction.user.username} quiere desatar su ira contra ${targetUser.username}! (está crazy)`;
                }
            } else {
                message = `${interaction.user.username} está enfadado!`;
            }
        } 
        else if (subcommand === 'bang') {
            // Da bang.js
            if (targetUser) {
                message = `${interaction.user.username} le dispara a ${targetUser.username}!`;
                if (interaction.user.username === targetUser.username) {
                    message = `${interaction.user.username} se dispara a sí mismo.`;
                }
            } else {
                message = `${interaction.user.username} está disparando!`;
            }
        } 
        else if (subcommand === 'bite') {
            // Da bite.js
            message = `${interaction.user.username} muerde a ${targetUser.username}!`;
            if (interaction.user.username === targetUser.username) {
                message = `${interaction.user.username} se muerde a sí mismo... eso dolió...`;
            }
        } 
        else if (subcommand === 'blush') {
            // Da blush.js
            message = `${interaction.user.username} se sonroja.`;
        } 
        else if (subcommand === 'claps') {
            // Da claps.js
            message = `${interaction.user.username} le aplaude a ${targetUser.username}!`;
            if (interaction.user.username === targetUser.username) {
                message = `Suki le aplaude a ${interaction.user.username}`;
            }
        } 
        else if (subcommand === 'confused') {
            // Da confused.js
            message = `${interaction.user.username} está confundido.`;
        } 
        else if (subcommand === 'dance') {
            // Da dance.js
            message = `${interaction.user.username} está bailando!`;
        } 
        else if (subcommand === 'eating') {
            // Da eating.js
            message = `${interaction.user.username} está comiendo.`;
        } 
        else if (subcommand === 'hug') {
            // Da hug.js
            message = `${interaction.user.username} abraza a ${targetUser.username}!`;
            if (interaction.user.username === targetUser.username) {
                message = `Suki abraza a ${interaction.user.username}`;
            }
        } 
        else if (subcommand === 'kiss') {
            // Da kiss.js
            message = `${interaction.user.username} besa a ${targetUser.username}!`;
            if (interaction.user.username === targetUser.username) {
                message = `${interaction.user.username} se besa a sí mismo... fue raro...`;
            }
        }

        // Crea l'embed
        const embed = new EmbedBuilder()
            .setDescription(message)
            .setColor('Random')
            .setTimestamp()
            .setImage(randomGif)
            .setFooter({ text: 'SukiBot' });

        await interaction.followUp({ embeds: [embed] });
    },
};
