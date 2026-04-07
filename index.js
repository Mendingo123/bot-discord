const {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
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

// 🧠 TABELA

function gerarTabela(venda) {
  let texto = `🔫 **ARMAS VENDIDAS**\n`;
  texto += venda.parceria ? "🟢 COM PARCERIA\n\n" : "🔴 SEM PARCERIA\n\n";

  const colArma = 18;
  const colQtd = 8;
  const colValor = 5;

  texto += "```";
  texto += `${"Arma".padEnd(colArma)}${"Qtd".padEnd(colQtd)}${"Valor".padStart(colValor)}\n`;

  let total = 0;

  venda.itens.forEach(a => {
    const preco = venda.parceria ? a.com : a.sem;
    const valor = preco * a.qtd;
    total += valor;

    const nome = a.nome.padEnd(colArma);
    const qtd = `[${a.qtd}]`.padEnd(colQtd);
    const val = `R$ ${valor.toLocaleString("pt-BR")}`.padEnd(colValor);

    texto += `${nome}${qtd}${val}\n`;
  });

  texto += "```";
  texto += `\n💰 TOTAL: R$ ${total.toLocaleString("pt-BR")}`;

  return texto;
}
// 🧠 TABELA FINAL

function gerarTabelaFinal(venda) {
  const colArma = 18;
  const colQtd = 8;
  const colValor = 5;

  let texto = `${"Arma".padEnd(colArma)}${"Qtd".padEnd(colQtd)}${"Valor".padStart(colValor)}\n`;

  let total = 0;

  venda.itens.forEach(a => {
    if (a.qtd > 0) {
      const preco = venda.parceria ? a.com : a.sem;
      const valor = preco * a.qtd;
      total += valor;

      const nome = a.nome.padEnd(colArma);
      const qtd = String(a.qtd).padEnd(colQtd);
      const val = `R$ ${valor.toLocaleString("pt-BR")}`.padEnd(colValor);

      texto += `${nome}${qtd}${val}\n`;
    }
  });

  return { texto, total };
}

// 🚀 painel botão
client.once("ready", async () => {
  console.log(`✅ Bot ligado como ${client.user.tag}`);

  const canal = await client.channels.fetch("1482757026432942331");

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("abrir_painel")
      .setLabel("📦 Abrir Painel")
      .setStyle(ButtonStyle.Primary)
  );

//mexer nissso?????????????????

  await canal.send({
    content: "📊 **SISTEMA DE VENDAS**\nClique abaixo para abrir seu painel.",
    components: [row]
  });
});

// 🎯 interação
client.on("interactionCreate", async (i) => {

  // 🔥 abrir painel
  if (i.customId === "abrir_painel") {

    vendas[i.user.id] = {
      parceria: false,
      itens: armasBase.map(a => ({ ...a, qtd: 0 }))
    };

    const venda = vendas[i.user.id];
    const rows = [];

    for (let i2 = 0; i2 < armasBase.length; i2 += 5) {
      const slice = armasBase.slice(i2, i2 + 5);

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

    for (let i2 = 0; i2 < armasBase.length; i2 += 5) {
      const slice = armasBase.slice(i2, i2 + 5);

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
      new ButtonBuilder()
        .setCustomId("parceria_on")
        .setLabel("🟢 COM")
        .setStyle(venda.parceria ? ButtonStyle.Success : ButtonStyle.Secondary),

      new ButtonBuilder()
        .setCustomId("parceria_off")
        .setLabel("🔴 SEM")
        .setStyle(!venda.parceria ? ButtonStyle.Danger : ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId("reset").setLabel("🗑 Resetar").setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId("finalizar").setLabel("📦 Finalizar").setStyle(ButtonStyle.Primary)
      )
    );

    return i.reply({
      content: gerarTabela(venda),
      components: rows,
      ephemeral: true
    });
  }

  // 🔥 MODAL (abrir)
  if (i.customId.startsWith("add_")) {
    const id = i.customId.replace("add_", "");

    const modal = new ModalBuilder()
      .setCustomId(`modal_${id}`)
      .setTitle("Adicionar quantidade");

    const input = new TextInputBuilder()
      .setCustomId("qtd")
      .setLabel("Digite a quantidade")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    modal.addComponents(
      new ActionRowBuilder().addComponents(input)
    );

    return i.showModal(modal);
  }

  // 🔥 MODAL (resposta)
  if (i.isModalSubmit()) {

    const id = i.customId.replace("modal_", "");
    const qtd = parseInt(i.fields.getTextInputValue("qtd"));

    if (isNaN(qtd) || qtd <= 0) {
      return i.reply({ content: "❌ Quantidade inválida!", ephemeral: true });
    }

    const venda = vendas[i.user.id];
    const item = venda.itens.find(a => a.id === id);

    item.qtd += qtd;

    return i.update({
      content: gerarTabela(venda)
    });
  }

  if (!vendas[i.user.id]) {
    vendas[i.user.id] = {
      parceria: false,
      itens: armasBase.map(a => ({ ...a, qtd: 0 }))
    };
  }

  const venda = vendas[i.user.id];

  if (i.customId.startsWith("rem_")) {
    const id = i.customId.replace("rem_", "");
    const item = venda.itens.find(a => a.id === id);
    if (item.qtd > 0) item.qtd--;
  }	

  if (i.customId === "parceria_on") venda.parceria = true;
  if (i.customId === "parceria_off") venda.parceria = false;
  if (i.customId === "reset") venda.itens.forEach(a => a.qtd = 0);

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
        { name: "📄 Itens vendidos", value: "```" + texto + "```" },
        { name: "💰 Total", value: `R$ ${total.toLocaleString("pt-BR")}`, inline: true },
        { name: "👤 Finalizado por", value: `${i.user}`, inline: true }
      )
      .setFooter({ text: "Cartel Sistema" })
      .setTimestamp();

    await canal.send({ embeds: [embed] });

    vendas[i.user.id] = {
      parceria: false,
      itens: armasBase.map(a => ({ ...a, qtd: 0 }))
    };

    return i.update({
      content: gerarTabela(vendas[i.user.id])
    });
  }

const rows = [];

// + botões
for (let i2 = 0; i2 < armasBase.length; i2 += 5) {
  const slice = armasBase.slice(i2, i2 + 5);

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

// - botões
for (let i2 = 0; i2 < armasBase.length; i2 += 5) {
  const slice = armasBase.slice(i2, i2 + 5);

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

// 🔥 parceria nova
rows.push(
  new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("parceria_on")
      .setLabel("🟢 COM")
      .setStyle(venda.parceria ? ButtonStyle.Success : ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId("parceria_off")
      .setLabel("🔴 SEM")
      .setStyle(!venda.parceria ? ButtonStyle.Danger : ButtonStyle.Secondary),

    new ButtonBuilder().setCustomId("reset").setLabel("🗑 Resetar").setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId("finalizar").setLabel("📦 Finalizar").setStyle(ButtonStyle.Primary)
  )
);

return i.update({
  content: gerarTabela(venda),
  components: rows
});
});

client.login(process.env.TOKEN);
