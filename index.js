const { Client, GatewayIntentBits } = require("discord.js");
const fs = require("fs");
require("dotenv").config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const FILE = "./caixa.json";

function carregarCaixa() {
  return JSON.parse(fs.readFileSync(FILE));
}

function salvarCaixa(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

client.once("ready", () => {
  console.log(`Bot online como ${client.user.tag}`);
});

client.on("interactionCreate", async interaction => {

  if (!interaction.isChatInputCommand()) return;

  const caixa = carregarCaixa();

  if (interaction.commandName === "caixa") {
    await interaction.reply(`🏦 Saldo do Caixa do MC: 💰 ${caixa.saldo}`);
  }

  if (interaction.commandName === "depositar") {
    const valor = interaction.options.getInteger("valor");

    caixa.saldo += valor;

    caixa.historico.push({
      tipo: "deposito",
      valor: valor,
      user: interaction.user.tag,
      data: new Date().toLocaleString()
    });

    salvarCaixa(caixa);

    await interaction.reply(`💰 ${valor} adicionado ao caixa. Novo saldo: ${caixa.saldo}`);
  }

  if (interaction.commandName === "retirar") {
    const valor = interaction.options.getInteger("valor");

    if (valor > caixa.saldo) {
      return interaction.reply("❌ O caixa não tem esse valor.");
    }

    caixa.saldo -= valor;

    caixa.historico.push({
      tipo: "retirada",
      valor: valor,
      user: interaction.user.tag,
      data: new Date().toLocaleString()
    });

    salvarCaixa(caixa);

    await interaction.reply(`💸 ${valor} retirado do caixa. Saldo atual: ${caixa.saldo}`);
  }

  if (interaction.commandName === "historico") {

    const ultimos = caixa.historico.slice(-10).reverse();

    let texto = ultimos.map(h =>
      `${h.tipo} | ${h.valor} | ${h.user} | ${h.data}`
    ).join("\n");

    await interaction.reply(`📜 Últimas transações:\n${texto || "Sem registros"}`);

  }

});

client.login(process.env.TOKEN);