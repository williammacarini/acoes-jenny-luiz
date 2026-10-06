/**
 * ============================================================
 *  ACOES ENTRE AMIGOS - JENNY & LUIZ
 *  Servidor gratuito no Google Apps Script
 * ============================================================
 *
 *  Este codigo faz a ponte entre o SITE e o seu PAINEL:
 *
 *   - O SITE grava aqui quando alguem escolhe numeros
 *   - O SITE le daqui para mostrar quais ja estao reservados
 *   - O PAINEL le daqui para voce validar os comprovantes
 *   - O PAINEL grava aqui quando voce confirma um pagamento
 *
 *  COMO INSTALAR: veja o arquivo COMO-CONFIGURAR.md
 * ============================================================
 */

/* Nome da aba da planilha */
var ABA = 'Reservas';

/* Senha simples que protege sua planilha. TROQUE se quiser. */
var TOKEN = 'jenny-luiz-2026';


/* ============================================================
   UTILITARIOS
   ============================================================ */

function pegarAba() {
  var planilha = SpreadsheetApp.getActiveSpreadsheet();
  var aba = planilha.getSheetByName(ABA);
  if (!aba) {
    aba = planilha.insertSheet(ABA);
    aba.appendRow(['Data', 'Numeros', 'Nome', 'WhatsApp', 'Total', 'Status']);
    aba.getRange('A1:F1').setFontWeight('bold').setBackground('#E8C5D4');
    aba.setFrozenRows(1);
    aba.setColumnWidth(1, 150);
    aba.setColumnWidth(2, 160);
    aba.setColumnWidth(3, 200);
    aba.setColumnWidth(4, 160);
    aba.setColumnWidth(5, 90);
    aba.setColumnWidth(6, 140);
  }
  return aba;
}

function responder(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/* Converte "5, 10, 15" ou "[5,10,15]" em lista de numeros */
function paraLista(txt) {
  return String(txt || '')
    .replace(/[\[\]]/g, '')
    .split(/[,\s;]+/)
    .map(function (x) { return parseInt(x, 10); })
    .filter(function (x) { return !isNaN(x); });
}

/* Le todas as linhas da planilha */
function lerLinhas() {
  var aba = pegarAba();
  var dados = aba.getDataRange().getValues();
  var out = [];
  for (var i = 1; i < dados.length; i++) {
    var l = dados[i];
    if (!l[1]) continue;
    var status = String(l[5] || 'aguardando').toLowerCase();
    out.push({
      linha: i + 1,                         /* linha real na planilha (1-based) */
      data: l[0] ? new Date(l[0]).toISOString() : null,
      numeros: String(l[1]),
      nome: String(l[2] || ''),
      whatsapp: String(l[3] || ''),
      total: String(l[4] || ''),
      status: status === 'confirmado' ? 'confirmado' : 'aguardando'
    });
  }
  return out;
}

/* Monta o mapa de status: { numero: {status, nome, whatsapp, data} } */
function mapaNumeros() {
  var registros = lerLinhas();
  var mapa = {};
  for (var i = 0; i < registros.length; i++) {
    var r = registros[i];
    var nums = paraLista(r.numeros);
    for (var j = 0; j < nums.length; j++) {
      mapa[nums[j]] = {
        status: r.status,                   /* 'aguardando' ou 'confirmado' */
        nome: r.nome,
        whatsapp: r.whatsapp,
        data: r.data,
        total: r.total
      };
    }
  }
  return mapa;
}


/* ============================================================
   GET  ->  devolve o status de todos os numeros
   Usado pelo SITE (mostrar quais estao reservados)
   e pelo PAINEL (listar o que validar)
   ============================================================ */

function doGet(e) {
  try {
    var token = (e && e.parameter && e.parameter.token) || '';
    if (token !== TOKEN) {
      return responder({ ok: false, erro: 'token invalido' });
    }

    var mapa = mapaNumeros();
    return responder({
      ok: true,
      atualizado: new Date().toISOString(),
      total: Object.keys(mapa).length,
      numeros: mapa,                        /* { "25": {status, nome, ...} } */
      reservas: lerLinhas()                 /* lista completa, para o painel */
    });

  } catch (erro) {
    return responder({ ok: false, erro: String(erro) });
  }
}


/* ============================================================
   POST  ->  tres acoes:
     acao = "reservar"   -> o site grava uma nova reserva
     acao = "confirmar"  -> o painel confirma um pagamento
     acao = "liberar"    -> o painel devolve um numero
   ============================================================ */

function doPost(e) {
  try {
    var corpo = {};

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

    var acao = String(corpo.acao || 'reservar');

    if (acao === 'confirmar') return acaoConfirmar(corpo);
    if (acao === 'liberar')   return acaoLiberar(corpo);

    return acaoReservar(corpo);

  } catch (erro) {
    return responder({ ok: false, erro: String(erro) });
  }
}


/* ---------- RESERVAR ---------- */
function acaoReservar(corpo) {
  var nums = corpo.numeros;
  if (Object.prototype.toString.call(nums) === '[object Array]') {
    nums = nums.join(', ');
  }
  nums = String(nums || '').trim();

  if (!nums) return responder({ ok: false, erro: 'nenhum numero informado' });

  var lista = paraLista(nums);
  if (!lista.length) return responder({ ok: false, erro: 'numeros invalidos' });

  var nome = String(corpo.nome || '').trim();
  var whatsapp = String(corpo.whatsapp || '').trim();
  var total = String(corpo.total || '').trim();

  if (!nome) return responder({ ok: false, erro: 'nome obrigatorio' });

  /* Verifica se algum numero ja foi reservado por outra pessoa */
  var mapa = mapaNumeros();
  var jaReservados = [];
  for (var i = 0; i < lista.length; i++) {
    if (mapa[lista[i]]) jaReservados.push(lista[i]);
  }
  if (jaReservados.length) {
    return responder({
      ok: false,
      erro: 'numeros ja reservados',
      numeros: jaReservados
    });
  }

  var aba = pegarAba();

  /* Evita duplicar exatamente a mesma reserva */
  var todas = aba.getDataRange().getValues();
  for (var i = 1; i < todas.length; i++) {
    if (String(todas[i][1] || '').trim() === nums &&
        String(todas[i][2] || '').trim() === nome) {
      return responder({ ok: true, duplicada: true });
    }
  }

  aba.appendRow([new Date(), nums, nome, whatsapp, total, 'aguardando']);

  return responder({ ok: true, mensagem: 'reserva gravada', numeros: nums });
}


/* ---------- CONFIRMAR ---------- */
function acaoConfirmar(corpo) {
  var lista = corpo.numeros;
  if (Object.prototype.toString.call(lista) !== '[object Array]') {
    lista = paraLista(lista);
  } else {
    lista = lista.map(function (x) { return parseInt(x, 10); });
  }
  if (!lista.length) return responder({ ok: false, erro: 'numeros invalidos' });

  var aba = pegarAba();
  var dados = aba.getDataRange().getValues();
  var alterados = 0;

  for (var i = 1; i < dados.length; i++) {
    var numsLinha = paraLista(dados[i][1]);
    var contem = false;
    for (var a = 0; a < lista.length; a++) {
      if (numsLinha.indexOf(lista[a]) !== -1) { contem = true; break; }
    }
    if (contem) {
      aba.getRange(i + 1, 6).setValue('confirmado');
      alterados++;
    }
  }

  return responder({ ok: true, linhas: alterados });
}


/* ---------- LIBERAR ---------- */
function acaoLiberar(corpo) {
  var lista = corpo.numeros;
  if (Object.prototype.toString.call(lista) !== '[object Array]') {
    lista = paraLista(lista);
  } else {
    lista = lista.map(function (x) { return parseInt(x, 10); });
  }
  if (!lista.length) return responder({ ok: false, erro: 'numeros invalidos' });

  var aba = pegarAba();
  var dados = aba.getDataRange().getValues();

  /* Reconstroi a planilha sem as linhas que contem esses numeros */
  var manter = [dados[0]];                 /* cabecalho */
  var removidos = 0;

  for (var i = 1; i < dados.length; i++) {
    var numsLinha = paraLista(dados[i][1]);
    var contem = false;
    for (var a = 0; a < lista.length; a++) {
      if (numsLinha.indexOf(lista[a]) !== -1) { contem = true; break; }
    }
    if (contem) {
      removidos++;
    } else {
      manter.push(dados[i]);
    }
  }

  if (removidos) {
    aba.clear();
    aba.getRange(1, 1, manter.length, 6).setValues(manter);
    aba.getRange('A1:F1').setFontWeight('bold').setBackground('#E8C5D4');
    aba.setFrozenRows(1);
  }

  return responder({ ok: true, removidos: removidos });
}


/* ============================================================
   TESTE - rode esta funcao no editor para conferir
   ============================================================ */
function teste() {
  var aba = pegarAba();
  Logger.log('Aba "' + ABA + '" pronta.');
  Logger.log('Linhas com dados: ' + (aba.getLastRow() - 1));
  var mapa = mapaNumeros();
  Logger.log('Numeros reservados: ' + Object.keys(mapa).length);
  Logger.log('Exemplo: ' + JSON.stringify(mapa).substring(0, 300));
}
