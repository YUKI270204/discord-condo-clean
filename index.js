require('dotenv').config();

const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Bot online');
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Servidor web activo');
});

const {
  Client,
  GatewayIntentBits,
  SlashCommandBuilder,
  REST,
  Routes,
  EmbedBuilder
} = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// ROLES PERMITIDOS
const allowedRoles = [
  '1495157672150962288', // Owner
  '1495163689299611709', // Admin
  '1495902970607304714', // Mod
  '1495900836193108028'  // Game Uploader
];

// CANAL
const CHANNEL_ID = '1506138099103826050';

// KEYS Y GRUPOS
const keysDatabase = {
  'vibecooker': 'https://www.roblox.com/es/communities/2613928/ROLVe#!/about',
  'MEG_Sword': 'https://www.roblox.com/es/communities/2613928/ROLVe#!/about',
  'MEG_V4': 'https://www.roblox.com/es/communities/2613928/ROLVe#!/about',
  'MEG_GOAT': 'https://www.roblox.com/es/communities/2613928/ROLVe#!/about',
  'MEG_Other': 'https://www.roblox.com/es/communities/2613928/ROLVe#!/about',

  'Tamales26': 'https://www.roblox.com/es/communities/4705120/Scriptbloxian-Studios#!/about'
};

// TIPOS DE JUEGO VÁLIDOS
const tiposValidos = ['SF', 'V4', 'GOAT', 'TAHU', 'OTHER'];

const commands = [
  new SlashCommandBuilder()
    .setName('condo')
    .setDescription('Publicar un condo')

    .addStringOption(option =>
      option.setName('enlace')
        .setDescription('Link del juego')
        .setRequired(true)
    )

    .addStringOption(option =>
      option.setName('key')
        .setDescription('Key del condo')
        .setRequired(true)
    )

    .addStringOption(option =>
      option.setName('tipo')
        .setDescription('Tipo de juego')
        .setRequired(true)
        .addChoices(
          { name: 'SF', value: 'SF' },
          { name: 'V4', value: 'V4' },
          { name: 'GOAT', value: 'GOAT' },
          { name: 'TAHU', value: 'TAHU' },
          { name: 'OTHER', value: 'OTHER' }
        )
    )

].map(cmd => cmd.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {

  try {

    console.log('Registrando comandos...');

    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.GUILD_ID
      ),
      { body: commands }
    );

    console.log('Comandos registrados.');

  } catch (error) {
    console.error(error);
  }

})();

client.once('clientReady', () => {
  console.log(`Conectado como ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {

  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'condo') {

    // VERIFICAR ROLES
    const memberRoles = interaction.member.roles.cache;

    const tienePermiso = allowedRoles.some(roleId =>
      memberRoles.has(roleId)
    );

    if (!tienePermiso) {
      return interaction.reply({
        content: '❌ No tienes permiso para usar este comando.',
        flags: 64
      });
    }

    const enlace = interaction.options.getString('enlace');
    const key = interaction.options.getString('key').trim();
    const tipo = interaction.options.getString('tipo');

    // VALIDAR TIPO
    if (!tiposValidos.includes(tipo)) {
      return interaction.reply({
        content: '❌ Tipo inválido.',
        flags: 64
      });
    }

    // DETECTAR GRUPO AUTOMÁTICAMENTE
    const grupo = keysDatabase[
      Object.keys(keysDatabase).find(
        k => k.toLowerCase() === key.toLowerCase()
      )
    ];

    // VALIDAR KEY
    if (!grupo) {
      return interaction.reply({
        content: '❌ Key no válida.',
        flags: 64
      });
    }

    // VALIDAR LINK ROBLOX
    if (
      !enlace.includes('roblox.com') &&
      !enlace.includes('www.roblox.com')
    ) {
      return interaction.reply({
        content: '❌ Solo se permiten links de Roblox.',
        flags: 64
      });
    }

    const embed = new EmbedBuilder()
      .setColor('#393838')
      .setTitle('🏠✨ CONDO ✨🏠')
      .setThumbnail('https://i.redd.it/j2em16zv5s2f1.gif')
      .setDescription('```🎮 NUEVO CONDO DISPONIBLE 🎮```')

      .addFields(
        {
          name: '🎮┃ TIPO',
          value: `\`${tipo}\``,
          inline: true
        },
        {
          name: '🔑┃ KEY',
          value: `\`${key}\``,
          inline: true
        },
        {
          name: '🔗┃ ENLACE DEL JUEGO',
          value: `[🎮 CLICK AQUÍ](${enlace})`,
          inline: false
        },
        {
          name: '👥┃ GRUPO',
          value: `[👤 CLICK AQUÍ](${grupo})`,
          inline: false
        }
      )

      .setImage('https://i.redd.it/k6y9y3dlesjf1.gif')

      .setFooter({
        text: '✨ Los condederos • Sistema automático'
      })

      .setTimestamp();

    // ENVIAR AL CANAL
    const canal = client.channels.cache.get(CHANNEL_ID);

    if (!canal) {
      return interaction.reply({
        content: '❌ No se encontró el canal.',
        flags: 64
      });
    }

    await canal.send({
      embeds: [embed]
    });

    await interaction.reply({
      content: '✅ Condo enviado correctamente.',
      flags: 64
    });

  }

});

client.login(process.env.TOKEN);

console.log('Bot ejecutándose...');