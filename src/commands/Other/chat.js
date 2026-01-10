const { SlashCommandBuilder } = require('discord.js');
const Groq = require('groq-sdk');

// Lee directamente de las variables de entorno de Koyeb
const groq = new Groq({ 
    apiKey: process.env.GROQ_API_KEY 
});

module.exports = {
    data: new SlashCommandBuilder()
        .setName('chat')
        .setDescription('Chatta con l\'AI')
        .addStringOption(option =>
            option.setName('messaggio')
                .setDescription('Il tuo messaggio')
                .setRequired(true)
        ),
    
    async execute(interaction) {
        await interaction.deferReply();
        
        const userMessage = interaction.options.getString('messaggio');
        
        try {
            const completion = await groq.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: "Sei un assistente amichevole in un server Discord. Rispondi in modo conciso e utile. Puoi rispondere in italiano o spagnolo secondo la lingua dell'utente."
                    },
                    {
                        role: "user",
                        content: userMessage
                    }
                ],
                model: "llama-3.1-70b-versatile",
                temperature: 0.7,
                max_tokens: 1024
            });
            
            const response = completion.choices[0].message.content;
            
            // Discord ha limite di 2000 caratteri
            if (response.length > 2000) {
                await interaction.editReply(response.substring(0, 1997) + '...');
            } else {
                await interaction.editReply(response);
            }
            
        } catch (error) {
            console.error('Errore Groq:', error);
            
            // Messaggio di errore più dettagliato
            if (error.message.includes('rate_limit')) {
                await interaction.editReply('⏱️ Limite di richieste raggiunto. Riprova tra qualche minuto.');
            } else if (error.message.includes('API key')) {
                await interaction.editReply('❌ Errore di configurazione API. Contatta l\'amministratore.');
            } else {
                await interaction.editReply('❌ Si è verificato un errore. Riprova più tardi.');
            }
        }
    }
};