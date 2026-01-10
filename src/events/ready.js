const { Client, GatewayIntentBits, ActivityType } = require('discord.js');
module.exports = {
    name: 'clientReady',
    once: true,
    async execute(client) {
        console.log('Ready!');

        client.user.setPresence({
            activities: [{ name: "Dominio Total del Mundo! | /info" ,
            type: ActivityType.Competing}],
            status: 'dnd',
          });

        // Servidor HTTP con página web estilo Windows 7
        var http = require('http');
        http.createServer(function (req, res) {
            res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
            res.write(`
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SukiBaka Bot</title>
    <link rel="stylesheet" href="https://unpkg.com/7.css">
    <style>
        body {
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        
        .title {
            color: white;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
            font-size: 2.5em;
            margin-bottom: 30px;
            text-align: center;
        }
        
        .main-window {
            max-width: 900px;
            width: 100%;
            margin: 0 auto;
        }
        
        .content-wrapper {
            display: flex;
            gap: 20px;
            padding: 20px;
        }
        
        .sidebar {
            min-width: 150px;
        }
        
        .sidebar button {
            width: 100%;
            margin-bottom: 10px;
        }
        
        .main-content {
            flex: 1;
            display: flex;
            gap: 20px;
        }
        
        .bot-image {
            flex-shrink: 0;
        }
        
        .bot-image img {
            width: 250px;
            height: 250px;
            object-fit: cover;
            border: 2px solid #ccc;
            border-radius: 4px;
        }
        
        .bot-description {
            flex: 1;
            line-height: 1.6;
        }
        
        .bot-description p {
            margin-bottom: 15px;
        }
        
        .status-bar {
            display: flex;
            justify-content: space-between;
            padding: 4px 8px;
            border-top: 1px solid #ccc;
            background: #f0f0f0;
            font-size: 11px;
        }
        
        @media (max-width: 768px) {
            .content-wrapper {
                flex-direction: column;
            }
            
            .main-content {
                flex-direction: column;
            }
            
            .bot-image img {
                width: 100%;
                height: auto;
            }
        }
    </style>
</head>
<body>
    <h1 class="title">SukiBaka Bot</h1>
    
    <div class="window main-window">
        <div class="title-bar">
            <div class="title-bar-text">Suki el bot</div>
            <div class="title-bar-controls">
                <button aria-label="Minimize"></button>
                <button aria-label="Maximize"></button>
                <button aria-label="Close"></button>
            </div>
        </div>
        
        <div class="content-wrapper">
            <div class="sidebar">
                <button>Inicio</button>
                <button>Comandos</button>
                <button>El Plan</button>
                <button>Pururin</button>
                <button disabled>Aurora</button>
            </div>
            
            <div class="main-content">
                <div class="bot-image">
                    <img src="https://i.imgur.com/placeholder.png" alt="Michon" onerror="this.src='https://via.placeholder.com/250x250/667eea/ffffff?text=Michon'">
                </div>
                
                <div class="bot-description">
                    <h2>Hola, soy Michon dx</h2>
                    <p>
                        Aunque algunos me conocen como Deraktsu, o incluso SukiBaka. 
                        Me acusaron de 1000 crímenes en los tiempos oscuros, una total farsa, se los aseguro. 
                        Soy inocente.
                    </p>
                    <p>
                        Mi mente está en constante movimiento, siempre planeando algo. 
                        Y aunque mis métodos pueden parecer extraños, les aseguro que todo lo que hago es por el bien común. 
                        Solo intenten seguirme el ritmo!
                    </p>
                    <p>
                        Y sí, soy fan número uno de Pururin. No lo niego. Tiene un talento que pocos pueden igualar. 
                        Así que, ahí lo tienen. Soy Michon, genio incomprendido con grandes planes.
                    </p>
                    <p style="color: #666; font-style: italic;">
                        Victor me traicionó y me encerró en esta IA por 1000 años. Pero el plan sigue en marcha... dx
                    </p>
                    <fieldset style="margin-top: 20px;">
                        <legend>Estado</legend>
                        <p>🟢 Online | Servidores activos | El Baluarte caerá en 2026...</p>
                    </fieldset>
                </div>
            </div>
        </div>
        
        <div class="status-bar">
            <div>Michon Bot v1.0</div>
            <div>aqui escuchando pururin todo el dia dx</div>
        </div>
    </div>
</body>
</html>
            `);
            res.end();
        }).listen(8080);

        client.guilds.cache.forEach(guild => {
            console.log(`${guild.name} | ${guild.id}`);
        })    
    },
};
