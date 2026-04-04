const {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once("ready", () => {
  console.log(`✅ Bot ligado como ${client.user.tag}`);
});

// 📊 armas
const armasBase = [
  { id: "hkp7", nome: "HKP7", sem: 50000, com: 45000 },
  { id: "hk", nome: "HK", sem: 60000, com: 55000 },
  { id: "five", nome: "FIVE SEVEN", sem: 85000, com: 75000 },
  { id: "tec9", nome: "TEC9", sem: 125000, com: 110000 },
  { id: "aug", nome: "AUG", sem: 170000, com: 150000 },
  { id: "evo3", nome: "EVO3", sem: 200000, com: 180000 },
  { id: "g36c", nome: "G36C", sem: 290000, com: 260000 },
  { id: "ak102", nome: "AK102", sem: 330000, com: 300000 },
  { id: "sig", nome: "SIG SAUER 556", sem: 390000, com: 350000 },
  { id: "c4", nome: "C4", sem: 5000, com: 4500 }
];

const vendas = {};


// 🧠 tabela painel (continua igual)
function gerarTabela(venda) {
  let texto = `🔫 **ARMAS VENDIDAS**\n`;
  texto += venda.parceria ? "🟢 COM PARCERIA\n\n" : "🔴 SEM PARCERIA\n\n";

  texto += "```Arma           Qtd        Valor\n";

  let total = 0;

  venda.itens.forEach(a => {
    const preco = venda.parceria ? a.com : a.sem;
    const valor = preco * a.qtd;
    total += valor;

    texto += `${a.nome.padEnd(16)} [${a.qtd}]     ${valor.toLocaleString("pt-BR")}\n`;
  });

  texto += "```";
  texto += `\n💰 TOTAL: ${total.toLocaleString("pt-BR")}`;

  return texto;
}


// 🧠 NOVA TABELA BONITA (SÓ PRA FINALIZAR)
function gerarTabelaFinal(venda) {
  let texto = "Arma            Qtd     Valor\n";
  let total = 0;

  venda.itens.forEach(a => {
    if (a.qtd > 0) {
      const preco = venda.parceria ? a.com : a.sem;
      const valor = preco * a.qtd;
      total += valor;

      texto += `${a.nome.padEnd(16)} ${String(a.qtd).padEnd(7)} ${valor.toLocaleString("pt-BR")}\n`;
    }
  });

  return { texto, total };
}


// 🚀 comando
client.on("messageCreate", async (message) => {
  if (message.content === "!vendas") {

    vendas[message.author.id] = {
      parceria: false,
      itens: armasBase.map(a => ({ ...a, qtd: 0 }))
    };

    const venda = vendas[message.author.id];
    const rows = [];

    for (let i = 0; i < armasBase.length; i += 5) {
      const slice = armasBase.slice(i, i + 5);

      rows.push(
        new ActionRowBuilder().addComponents(
          slice.map(a =>
            new ButtonBuilder()
              .setCustomId(`add_${a.id}`)
              .setLabel(`+ ${a.nome}`)
              .setStyle(ButtonStyle.Secondary)
          )
        )
      );
    }

    for (let i = 0; i < armasBase.length; i += 5) {
      const slice = armasBase.slice(i, i + 5);

      rows.push(
        new ActionRowBuilder().addComponents(
          slice.map(a =>
            new ButtonBuilder()
              .setCustomId(`rem_${a.id}`)
              .setLabel(`- ${a.nome}`)
              .setStyle(ButtonStyle.Secondary)
          )
        )
      );
    }

    rows.push(
      new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("parceria").setLabel("🔄 Parceria").setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId("reset").setLabel("🗑 Resetar").setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId("finalizar").setLabel("📦 Finalizar").setStyle(ButtonStyle.Primary)
      )
    );

    message.reply({
      content: gerarTabela(venda),
      components: rows
    });
  }
});


// 🎯 interação
client.on("interactionCreate", async (i) => {

  if (!vendas[i.user.id]) {
    vendas[i.user.id] = {
      parceria: false,
      itens: armasBase.map(a => ({ ...a, qtd: 0 }))
    };
  }

  const venda = vendas[i.user.id];

  if (i.customId.startsWith("add_")) {
    const id = i.customId.replace("add_", "");
    venda.itens.find(a => a.id === id).qtd++;
  }

  if (i.customId.startsWith("rem_")) {
    const id = i.customId.replace("rem_", "");
    const item = venda.itens.find(a => a.id === id);
    if (item.qtd > 0) item.qtd--;
  }

  if (i.customId === "parceria") {
    venda.parceria = !venda.parceria;
  }

  if (i.customId === "reset") {
    venda.itens.forEach(a => a.qtd = 0);
  }

  // 🔥 FINALIZAR CORRIGIDO
  if (i.customId === "finalizar") {

    const { texto, total } = gerarTabelaFinal(venda);

    if (total === 0) {
      return i.reply({ content: "❌ Nenhum item selecionado!", ephemeral: true });
    }

    const canal = await i.guild.channels.fetch("1482756821977403452");

    const embed = new EmbedBuilder()
      .setTitle("📦 NOVA VENDA")
      .setColor(venda.parceria ? 0x00ff88 : 0xff3c3c)
      .setDescription(venda.parceria ? "🟢 COM PARCERIA" : "🔴 SEM PARCERIA")
      .addFields(
        {
          name: "📄 Itens vendidos",
          value: "```" + texto + "```"
        },
        {
          name: "💰 Total",
          value: `R$ ${total.toLocaleString("pt-BR")}`,
          inline: true
        },
        {
          name: "👤 Finalizado por",
          value: `${i.user}`,
          inline: true
        }
      )
      .setFooter({ text: "Cartel Sistema" })
      .setTimestamp();

    await canal.send({ embeds: [embed] });

    vendas[i.user.id] = {
      parceria: false,
      itens: armasBase.map(a => ({ ...a, qtd: 0 }))
    };

    return i.reply({ content: "✅ Venda enviada!", ephemeral: true });
  }

  return i.update({
    content: gerarTabela(venda)
  });
});
client.login("SEU_TOKEN_AQUI");