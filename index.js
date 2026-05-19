require('dotenv').config();

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
      option.setName('grupo')
        .setDescription('Grupo')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('key')
        .setDescription('Key')
        .setRequired(true)
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

    console.log('Comandos registrados correctamente.');
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

    const enlace = interaction.options.getString('enlace');
    const grupo = interaction.options.getString('grupo');
    const key = interaction.options.getString('key');

    const imagen = 'https://i.redd.it/k6y9y3dlesjf1.gif';

    const embed = new EmbedBuilder()
      .setColor('#393838')
      .setTitle('🏠✨ CONDO ✨🏠')
      .setThumbnail('https://i.redd.it/j2em16zv5s2f1.gif')
      .setDescription('```🎮 NUEVO CONDO DISPONIBLE 🎮```')
      .addFields(
        {
          name: '🔗┃ ENLACE DEL JUEGO',
          value: `[🎮 CLICK AQUÍ](${enlace})`,
          inline: false
        },
        {
          name: '👥┃ GRUPO',
          value: `[👤 CLICK AQUÍ](${grupo})`,
          inline: true
        },
        {
          name: '🔑┃ KEY DE ACCESO',
          value: `\`${key}\``,
          inline: true
        }
      )
      .setImage(imagen)
      .setFooter({
        text: '✨ Los condederos • Sistema automático'
      })
      .setTimestamp();

    const canal = client.channels.cache.get('1506138099103826050');

      await canal.send({
      embeds: [embed]
      });

      await interaction.reply({
      content: '✅ Condo enviado correctamente.',
      ephemeral: true
      });

  }
});

client.login(process.env.TOKEN);

console.log('Bot ejecutándose...');