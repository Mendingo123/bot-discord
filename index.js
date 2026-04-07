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
let contadorVendas = 1;
const vendasLog = {};

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
  
// 🚀 painel
const embed = new EmbedBuilder()
  .setTitle("📊 SISTEMA DE VENDAS")
  .setDescription(
    "**Bem-vindo ao sistema de vendas do Cartel!**\n\n" +
    "Aqui você poderá registrar suas vendas de forma rápida e organizada.\n\n" +
    "• Clique no botão abaixo para abrir seu painel\n" +
    "• Adicione os itens vendidos\n" +
    "• Finalize e registre automaticamente\n\n" +
    "💰 Controle total das suas vendas"
  )
  .setColor(0x2b2d31) // cor escura estilo discord
  .setImage("https://cdn.discordapp.com/attachments/1482745869198692362/1490470354806640720/0405_1.gif") // 👈 sua imagem do cartel
  .setFooter({ text: "Cartel Sistema" });

const mensagem = await canal.send({
  content: "<@&1490405460279300106>",
  embeds: [embed],
  components: [row]
});


await mensagem.pin();
  
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
              .setLabel(a.nome)
              .setEmoji("➕")
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

const venda = vendas[i.user.id];
const item = venda.itens.find(a => a.id === id);

const input = new TextInputBuilder()
  .setCustomId("qtd")
  .setLabel("Digite a quantidade")
  .setStyle(TextInputStyle.Short)
  .setValue(String(item.qtd || "")) // 👈 AQUI O SEGREDO
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
    
    if (isNaN(qtd)) {
    return i.reply({ content: "❌ Quantidade inválida!", ephemeral: true });
  }
    
    const venda = vendas[i.user.id];
    const item = venda.itens.find(a => a.id === id);
    
  // ✅ lógica correta
  if (qtd <= 0) {
    item.qtd = 0;
  } else {
    item.qtd = qtd;
  }

return i.update({
  content: gerarTabela(venda),
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
      .setTitle(`📦 VENDA #${contadorVendas}`)
      .setColor(venda.parceria ? 0x00ff88 : 0xff3c3c)
      .setDescription(venda.parceria ? "🟢 COM PARCERIA" : "🔴 SEM PARCERIA")
      .setThumbnail("https://cdn.discordapp.com/attachments/1482745869198692362/1490470354806640720/0405_1.gif")          
      .addFields(
        { name: "📄 Itens vendidos", value: "```" + texto + "```" },
        { name: "💰 Total", value: `R$ ${total.toLocaleString("pt-BR")}`, inline: true },
        { name: "👤 Finalizado por", value: `${i.user}`, inline: true }
      )
      .setFooter({ text: "Cartel Sistema" })
      .setTimestamp();

    const msg = await canal.send({
      content: "📢 Nova venda registrada! <@&1482738310819352719>",
      embeds: [embed]
    });

    vendasLog[contadorVendas] = {
      msgId: msg.id,
      vendedor: i.user.id
    };

    contadorVendas++;

    vendas[i.user.id] = {
      parceria: false,
      itens: armasBase.map(a => ({ ...a, qtd: 0 }))
    };

    return i.update({
      content: gerarTabela(vendas[i.user.id])   // ✅ AQUI FOI A CORREÇÃO
    });
  }

  // atualizar painel
  const rows = [];
  for (let i2 = 0; i2 < armasBase.length; i2 += 5) {
    const slice = armasBase.slice(i2, i2 + 5);

    rows.push(
      new ActionRowBuilder().addComponents(
        slice.map(a =>
          new ButtonBuilder()
            .setCustomId(`add_${a.id}`)
            .setLabel(a.nome)
            .setEmoji("➕")
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
});
});

   //🔥 1. PAINEL (coloca no ready)
   
client.once("ready", async () => {

  const canalControle = await client.channels.fetch("1490513274867945603");

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("apagar_venda_btn")
      .setLabel("🗑 APAGAR")
      .setStyle(ButtonStyle.Danger)
  );

  await canalControle.send({
    content: "📕 **CONTROLE DE VENDAS**\n\nAqui é onde você apaga vendas erradas, perdidas ou roubadas.\nClique no botão abaixo:",
    components: [row]
  });

});

client.on("interactionCreate", async (i) => {

  // 🔥 botão
  if (i.isButton() && i.customId === "apagar_venda_btn") {

    const modal = new ModalBuilder()
      .setCustomId("modal_apagar_venda")
      .setTitle("Apagar Venda");

    const numero = new TextInputBuilder()
      .setCustomId("numero")
      .setLabel("Número da venda")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const motivo = new TextInputBuilder()
      .setCustomId("motivo")
      .setLabel("Motivo")
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    modal.addComponents(
      new ActionRowBuilder().addComponents(numero),
      new ActionRowBuilder().addComponents(motivo)
    );

    return i.showModal(modal);
  }

  // 🔥 modal
  if (i.isModalSubmit() && i.customId === "modal_apagar_venda") {

    const numero = parseInt(i.fields.getTextInputValue("numero"));
    const motivo = i.fields.getTextInputValue("motivo");

    if (isNaN(numero)) {
      return i.reply({ content: "❌ Número inválido!", ephemeral: true });
    }

    const dados = vendasLog[numero];

    if (!dados) {
      return i.reply({ content: "❌ Venda não encontrada!", ephemeral: true });
    }

    try {
      const canalVendas = await i.guild.channels.fetch("1482756821977403452");
      const mensagem = await canalVendas.messages.fetch(dados.msgId);

      await mensagem.delete();
      delete vendasLog[numero];

      const canalLog = await i.guild.channels.fetch("1490555425496502412");

      const embed = new EmbedBuilder()
        .setTitle(`🗑 VENDA APAGADA #${numero}`)
        .setColor(0xff3c3c)
        .setThumbnail("https://cdn.discordapp.com/attachments/1482745869198692362/1490470354806640720/0405_1.gif")
        .addFields(
          { name: "👤 Apagado por", value: `${i.user}`, inline: true },
          { name: "📦 Vendedor", value: `<@${dados.vendedor}>`, inline: true },
          { name: "📝 Motivo", value: motivo }
        )
        .setFooter({ text: "Sistema Cartel" })
        .setTimestamp();

      await canalLog.send({ embeds: [embed] });

      return i.reply({
        content: `✅ Venda #${numero} apagada com sucesso!`,
        ephemeral: true
      });

    } catch {
      return i.reply({
        content: "❌ Erro ao apagar venda.",
        ephemeral: true
      });
    }
  }

});

client.login(process.env.TOKEN);
