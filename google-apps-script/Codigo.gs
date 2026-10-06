/**
 * ============================================================
 *  ACOES ENTRE AMIGOS - JENNY & LUIZ
 *  Servidor gratuito no Google Apps Script
 * ============================================================
 *
 *  Este codigo faz a ponte entre o SITE e o seu PAINEL.
 *
 *  COMO INSTALAR (passo a passo no arquivo COMO-CONFIGURAR.md):
 *   1. Crie uma planilha no Google Sheets
 *   2. Abra Extensoes > Apps Script
 *   3. Cole este codigo
 *   4. Clique em Implantar > Nova implantacao
 *   5. Copie a URL gerada e cole no site e no painel
 *
 * ============================================================
 */

/* Nome da aba da planilha onde as reservas sao gravadas */
var ABA = 'Reservas';

/* Senha simples para proteger a leitura/escrita (troque se quiser) */
var TOKEN = 'jenny-luiz-2026';

/**
 * Retorna a aba, criando-a com cabecalho se ainda nao existir.
 */
function pegarAba() {
  var planilha = SpreadsheetApp.getActiveSpreadsheet();
  var aba = planilha.getSheetByName(ABA);
  if (!aba) {
    aba = planilha.insertSheet(ABA);
    aba.appendRow(['Data', 'Numeros', 'Nome', 'WhatsApp', 'Total', 'Status']);
    aba.getRange('A1:F1').setFontWeight('bold').setBackground('#E8C5D4');
    aba.setFrozenRows(1);
    aba.setColumnWidth(1, 150);
    aba.setColumnWidth(2, 120);
    aba.setColumnWidth(3, 200);
    aba.setColumnWidth(4, 150);
    aba.setColumnWidth(5, 90);
    aba.setColumnWidth(6, 130);
  }
  return aba;
}

/**
 * Resposta padrao em JSON.
 */
function responder(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * GET  -> devolve todas as reservas
 * Usado pelo painel admin para saber o que validar.
 *
 * Exemplo:
 *   .../exec?token=jenny-luiz-2026
 */
function doGet(e) {
  try {
    var token = (e && e.parameter && e.parameter.token) || '';
    if (token !== TOKEN) {
      return responder({ ok: false, erro: 'token invalido' });
    }

    var aba = pegarAba();
    var dados = aba.getDataRange().getValues();
    var reservas = [];

    /* Comeca da linha 1 (indice 1) para pular o cabecalho */
    for (var i = 1; i < dados.length; i++) {
      var l = dados[i];
      if (!l[1]) continue;                 /* linha vazia */
      reservas.push({
        data: l[0] ? new Date(l[0]).toISOString() : null,
        numeros: String(l[1]),
        nome: String(l[2] || ''),
        whatsapp: String(l[3] || ''),
        total: String(l[4] || ''),
        status: String(l[5] || 'aguardando')
      });
    }

    return responder({ ok: true, total: reservas.length, reservas: reservas });

  } catch (erro) {
    return responder({ ok: false, erro: String(erro) });
  }
}

/**
 * POST -> grava uma nova reserva vinda do site.
 *
 * Corpo esperado (JSON):
 *   {
 *     token: "jenny-luiz-2026",
 *     numeros: [5, 10, 15],
 *     nome: "Maria Silva",
 *     whatsapp: "(48) 99958-9697",
 *     total: "R$ 6,00"
 *   }
 */
function doPost(e) {
  try {
    var corpo = {};

    /* O site pode mandar como JSON puro ou como formulario */
    if (e && e.postData && e.postData.contents) {
      try {
        corpo = JSON.parse(e.postData.contents);
      } catch (x) {
        corpo = (e.parameter || {});
      }
    } else {
      corpo = (e.parameter || {});
    }

    if (String(corpo.token || '') !== TOKEN) {
      return responder({ ok: false, erro: 'token invalido' });
    }

    var numeros = corpo.numeros;
    if (Object.prototype.toString.call(numeros) === '[object Array]') {
      numeros = numeros.join(', ');
    }
    numeros = String(numeros || '').trim();

    if (!numeros) {
      return responder({ ok: false, erro: 'nenhum numero informado' });
    }

    var nome = String(corpo.nome || '').trim();
    var whatsapp = String(corpo.whatsapp || '').trim();
    var total = String(corpo.total || '').trim();

    if (!nome) {
      return responder({ ok: false, erro: 'nome obrigatorio' });
    }

    var aba = pegarAba();

    /* Evita duplicar a mesma reserva se a pessoa clicar duas vezes */
    var existentes = aba.getDataRange().getValues();
    for (var i = 1; i < existentes.length; i++) {
      var numsGravados = String(existentes[i][1] || '');
      var nomeGravado = String(existentes[i][2] || '');
      if (numsGravados === numeros && nomeGravado === nome) {
        return responder({ ok: true, duplicada: true, mensagem: 'reserva ja registrada' });
      }
    }

    aba.appendRow([
      new Date(),
      numeros,
      nome,
      whatsapp,
      total,
      'aguardando'
    ]);

    return responder({ ok: true, mensagem: 'reserva gravada', numeros: numeros });

  } catch (erro) {
    return responder({ ok: false, erro: String(erro) });
  }
}

/**
 * Teste rapido: rode esta funcao no editor para conferir se a aba esta ok.
 */
function teste() {
  var aba = pegarAba();
  Logger.log('Aba "' + ABA + '" pronta. Linhas: ' + aba.getLastRow());
}
