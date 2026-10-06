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

  /* Lista de numeros que ainda faltam confirmar */
  var faltam = lista.slice();

  for (var i = 1; i < dados.length; i++) {
    var numsLinha = paraLista(dados[i][1]);

    /* Quais numeros DESTA linha estao sendo confirmados? */
    var confirmarAgora = [];
    var manterNaLinha = [];
    for (var a = 0; a < numsLinha.length; a++) {
      if (lista.indexOf(numsLinha[a]) !== -1) {
        confirmarAgora.push(numsLinha[a]);
      } else {
        manterNaLinha.push(numsLinha[a]);
      }
    }
    if (!confirmarAgora.length) continue;

    /* Remove da lista de pendentes */
    for (var c = 0; c < confirmarAgora.length; c++) {
      var idx = faltam.indexOf(confirmarAgora[c]);
      if (idx !== -1) faltam.splice(idx, 1);
    }

    var statusLinha = String(dados[i][5] || '').toLowerCase();

    if (manterNaLinha.length === 0) {
      /* A LINHA INTEIRA foi confirmada: so muda o status */
      if (statusLinha !== 'confirmado') {
        aba.getRange(i + 1, 6).setValue('confirmado');
        alterados++;
      }
    } else {
      /* SO PARTE da linha: divide em duas linhas */
      var nome = dados[i][2];
      var whats = dados[i][3];
      var total = dados[i][4];
      var data = dados[i][0];

      /* Linha original fica so com os nao confirmados (aguardando) */
      aba.getRange(i + 1, 2).setValue(manterNaLinha.join(', '));
      aba.getRange(i + 1, 6).setValue('aguardando');

      /* Cria uma nova linha com os confirmados */
      aba.appendRow([data, confirmarAgora.join(', '), nome, whats, total, 'confirmado']);
      alterados++;
    }
  }

  return responder({
    ok: true,
    alterados: alterados,
    naoEncontrados: faltam
  });
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

  /* Reconstroi a planilha removendo APENAS os numeros pedidos.
     Se a linha tem outros numeros, ela continua com eles.          */
  var manter = [dados[0]];
  var removidos = 0;

  for (var i = 1; i < dados.length; i++) {
    var numsLinha = paraLista(dados[i][1]);
    var restantes = [];

    for (var a = 0; a < numsLinha.length; a++) {
      if (lista.indexOf(numsLinha[a]) === -1) {
        restantes.push(numsLinha[a]);
      } else {
        removidos++;
      }
    }

    if (restantes.length === numsLinha.length) {
      /* Nada foi removido desta linha: mantem como esta */
      manter.push(dados[i]);
    } else if (restantes.length > 0) {
      /* Sobraram numeros: atualiza a linha */
      var linha = dados[i].slice();
      linha[1] = restantes.join(', ');
      manter.push(linha);
    }
    /* Se restantes estiver vazio, a linha inteira sai */
  }

  if (removidos) {
    aba.clear();
    if (manter.length) {
      aba.getRange(1, 1, manter.length, 6).setValues(manter);
      aba.getRange('A1:F1').setFontWeight('bold').setBackground('#E8C5D4');
      aba.setFrozenRows(1);
    }
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
