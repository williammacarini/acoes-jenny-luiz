#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
sincronizar.py
--------------
Embute os dados de data.json dentro do index.html, para que o site funcione
mesmo quando aberto com duplo-clique (protocolo file://), onde o navegador
bloqueia o carregamento de arquivos externos por seguranca (CORS).

COMO USAR (depois de mexer no data.json ou de baixar o data.json do painel):
    python3 sincronizar.py

O script e seguro para rodar quantas vezes quiser: ele substitui o bloco
de dados anterior em vez de duplicar.
"""

import json
import os
import sys

BASE = os.path.dirname(os.path.abspath(__file__))
DATA_JSON = os.path.join(BASE, "data.json")
INDEX_HTML = os.path.join(BASE, "index.html")
ADMIN_HTML = os.path.join(BASE, "admin.html")

INICIO = "/* === DADOS_EMBUTIDOS_INICIO === */"
FIM = "/* === DADOS_EMBUTIDOS_FIM === */"


def carregar_dados():
    if not os.path.exists(DATA_JSON):
        sys.exit("ERRO: data.json nao encontrado em " + BASE)
    with open(DATA_JSON, "r", encoding="utf-8") as f:
        return json.load(f)


def bloco_js(dados):
    """Monta o bloco <script> com os dados embutidos."""
    # separators compactos deixam o arquivo menor; ensure_ascii=False mantem acentos
    payload = json.dumps(dados, ensure_ascii=False, separators=(",", ":"))
    return (
        "<script>\n"
        + INICIO + "\n"
        + "var DADOS_EMBUTIDOS = " + payload + ";\n"
        + FIM + "\n"
        + "</script>"
    )


def injetar(html, novo_bloco):
    """Substitui o bloco de dados existente ou injeta antes de </body>."""
    if INICIO in html and FIM in html:
        antes = html[: html.index(INICIO)]
        depois = html[html.index(FIM) + len(FIM):]

        corte = antes.rfind("<script>")
        if corte != -1:
            antes = antes[:corte]

        fecha = depois.find("</script>")
        if fecha != -1:
            depois = depois[fecha + len("</script>"):]

        return antes + novo_bloco + depois, "atualizado"

    marcador = "</body>"
    if marcador not in html:
        return None, "erro"
    return html.replace(marcador, novo_bloco + "\n\n" + marcador, 1), "inserido"


def main():
    dados = carregar_dados()
    novo_bloco = bloco_js(dados)

    resultados = []
    for arquivo in (INDEX_HTML, ADMIN_HTML):
        if not os.path.exists(arquivo):
            continue
        with open(arquivo, "r", encoding="utf-8") as f:
            html = f.read()
        saida, acao = injetar(html, novo_bloco)
        if saida is None:
            print("AVISO: nao encontrei </body> em " + os.path.basename(arquivo))
            continue
        with open(arquivo, "w", encoding="utf-8") as f:
            f.write(saida)
        resultados.append((os.path.basename(arquivo), acao))

    camp = dados.get("campanha", {})
    numeros = dados.get("numeros", [])
    livres = sum(1 for n in numeros if n.get("s") == 0)
    vendidos = len(numeros) - livres

    print("=" * 58)
    print("  SINCRONIZACAO CONCLUIDA")
    print("=" * 58)
    for nome, acao in resultados:
        tam = os.path.getsize(os.path.join(BASE, nome)) / 1024
        print("  " + nome.ljust(15) + ": bloco " + acao + " (" + ("%.1f" % tam) + " KB)")
    print("-" * 58)
    print("  Numeros         : " + str(len(numeros)))
    print("  Livres          : " + str(livres))
    print("  Escolhidos      : " + str(vendidos))
    print("  Premios         : " + str(len(camp.get("premios", []))))
    print("=" * 58)
    print("  Pronto! Os arquivos funcionam com duplo-clique e no GitHub.")
    print("=" * 58)


if __name__ == "__main__":
    main()
