#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
configurar-servidor.py
----------------------
Configura a URL do Google Apps Script no projeto, testa a conexao
e publica.

COMO USAR:
    python3 configurar-servidor.py "https://script.google.com/macros/s/.../exec"
"""

import json
import os
import re
import subprocess
import sys
import urllib.request
import urllib.error

BASE = os.path.dirname(os.path.abspath(__file__))
DATA_JSON = os.path.join(BASE, "data.json")


def erro(msg):
    print()
    print("  ERRO: " + msg)
    print()
    sys.exit(1)


def validar_url(url):
    """Confere se a URL e realmente do Apps Script."""
    if "docs.google.com/spreadsheets" in url:
        erro(
            "Essa e a URL da PLANILHA, nao do servidor.\n\n"
            "        A URL correta comeca com:\n"
            "          https://script.google.com/macros/s/.../exec\n\n"
            "        Voce gera ela no Apps Script:\n"
            "          Extensoes > Apps Script > Implantar > Nova implantacao\n"
            "          > tipo 'App da Web' > Implantar"
        )
    if "script.google.com" not in url:
        erro("A URL precisa ser do script.google.com")
    if not url.rstrip("/").endswith("/exec"):
        print("  AVISO: a URL normalmente termina em /exec")
        print("         Vou tentar mesmo assim.")
    return url.strip()


def testar_conexao(url, token):
    """Faz um GET no servidor para ver se responde."""
    alvo = url + "?token=" + urllib.parse.quote(token) + "&t=" + str(os.getpid())
    print("  Testando conexao...")
    try:
        req = urllib.request.Request(alvo, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=25) as r:
            corpo = r.read().decode("utf-8", errors="replace")
    except urllib.error.HTTPError as e:
        erro("O servidor respondeu HTTP " + str(e.code) + ".\n"
             "        Confira se a implantacao esta como 'Qualquer pessoa'.")
    except Exception as e:
        erro("Nao consegui conectar: " + str(e) + "\n"
             "        Confira se a URL esta correta e se o app foi implantado.")

    try:
        d = json.loads(corpo)
    except Exception:
        erro("O servidor nao devolveu JSON valido.\n"
             "        Resposta recebida:\n        " + corpo[:300])

    if not d.get("ok"):
        erro("O servidor respondeu com erro: " + str(d.get("erro", "desconhecido")) +
             "\n        Verifique se o TOKEN no Codigo.gs e igual ao do data.json")

    return d


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    url = validar_url(sys.argv[1])

    print()
    print("=" * 58)
    print("  CONFIGURANDO O SERVIDOR")
    print("=" * 58)
    print("  URL: " + url)
    print()

    with open(DATA_JSON, "r", encoding="utf-8") as f:
        d = json.load(f)

    token = d["campanha"].get("tokenServidor", "jenny-luiz-2026")

    # Testa antes de salvar
    resultado = testar_conexao(url, token)
    print("  Conexao OK! Servidor respondeu:")
    print("     numeros reservados ate agora: " + str(resultado.get("total", 0)))

    # Salva
    d["campanha"]["urlServidor"] = url
    with open(DATA_JSON, "w", encoding="utf-8") as f:
        json.dump(d, f, ensure_ascii=False, indent=2)
    print("  URL salva no data.json")

    # Sincroniza os HTMLs
    print()
    print("  Sincronizando os HTMLs...")
    r = subprocess.run([sys.executable, os.path.join(BASE, "sincronizar.py")],
                       capture_output=True, text=True, cwd=BASE)
    if r.returncode != 0:
        erro("Falha no sincronizar.py:\n" + r.stderr)
    print("  " + "  ".join(l for l in r.stdout.splitlines() if ":" in l and "index" in l or "admin" in l))

    # Publica
    print()
    print("  Publicando no GitHub...")
    try:
        subprocess.run(["git", "add", "-A"], cwd=BASE, check=True,
                       capture_output=True)
        subprocess.run(
            ["git", "commit", "-q", "-m",
             "Ativa sincronizacao com o Google Sheets"],
            cwd=BASE, check=True, capture_output=True)
        subprocess.run(["git", "push", "-q", "origin", "main"],
                       cwd=BASE, check=True, capture_output=True)
        print("  Publicado! O Netlify atualiza em ~30 segundos.")
    except subprocess.CalledProcessError as e:
        print("  AVISO: nao consegui publicar automaticamente.")
        print("         Rode manualmente:")
        print("           git add -A && git commit -m 'Ativa servidor' && git push")

    print()
    print("=" * 58)
    print("  PRONTO! INTEGRACAO ATIVA")
    print("=" * 58)
    print()
    print("  Agora funciona assim:")
    print("    1. Pessoa escolhe numeros no site")
    print("    2. Os dados vao para a sua planilha na hora")
    print("    3. Voce abre o painel e ve em 'aguardando comprovante'")
    print("    4. Voce confirma o pagamento")
    print("    5. O site mostra 'confirmado' para todos")
    print()
    print("  Teste: reserve um numero no site e abra o painel.")
    print("=" * 58)


if __name__ == "__main__":
    import urllib.parse  # noqa
    main()
