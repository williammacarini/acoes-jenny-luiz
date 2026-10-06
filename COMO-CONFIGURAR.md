# 🔄 Como fazer o site e o painel conversarem

## O problema que você viu

Você reservou o número 25 no painel, mas ele continuava **verde (livre)** no site.
E o número 24 aparecia como confirmado, mas o 25 não.

**Motivo:** o site e o painel são arquivos separados. O que você marca no painel
fica só na memória do navegador até você baixar o `data.json` e subir no GitHub.

**Consequência grave:** duas pessoas podem escolher o mesmo número sem saber.

---

## ✅ A solução: Google Sheets (10 minutos, grátis)

Uma planilha na nuvem que o site e o painel usam juntos.

```
      PESSOA ESCOLHE NO SITE
              |
              v
      [ PLANILHA GOOGLE ]  <-- ponto central
              |
              v
      VOCE VALIDA NO PAINEL
              |
              v
      SITE MOSTRA ATUALIZADO PARA TODOS
```

**O que você ganha:**
- ✅ Número reservado aparece **na hora** para todos
- ✅ Ninguém consegue escolher número já reservado
- ✅ Você confirma o pagamento e o site atualiza sozinho
- ✅ Não precisa mais baixar/subir arquivo
- ✅ Você vê tudo numa planilha, se quiser

---

# 📋 PASSO A PASSO

## Passo 1 — Criar a planilha

1. Abra **[sheets.google.com](https://sheets.google.com)**
2. Clique no **+** (canto inferior direito) para criar uma planilha
3. Nomeie: **Reservas Ações Jenny & Luiz**

## Passo 2 — Abrir o editor de código

1. No menu superior da planilha: **Extensões** → **Apps Script**
2. Vai abrir uma nova aba com um editor

## Passo 3 — Colar o código

1. **Selecione tudo** no editor (`Ctrl+A` / `Cmd+A`) e **apague**
2. Abra o arquivo **`google-apps-script/Codigo.gs`** desta pasta
3. Copie **todo** o conteúdo
4. Cole no editor
5. Salve com `Ctrl+S` / `Cmd+S` (ou ícone de disquete)

O nome do projeto pode ficar como "Projeto sem título".

## Passo 4 — Publicar

1. Clique em **Implantar** → **Nova implantação** (canto superior direito)
2. Clique na **engrenagem ⚙️** ao lado de "Selecionar tipo"
3. Escolha **App da Web**
4. Preencha:
   - **Descrição:** `Reservas`
   - **Executar como:** **Eu (seu email)**
   - **Quem pode acessar:** **Qualquer pessoa**
5. Clique em **Implantar**

### ⚠️ Vai aparecer um aviso do Google

> "O Google não verificou este app"

Isso é **normal** — o script é seu, não de terceiros. Faça:

1. Clique em **Autorizar acesso**
2. Escolha sua conta Google
3. Clique em **Avançado**
4. Clique em **Acessar Reservas (não seguro)**
5. Clique em **Permitir**

## Passo 5 — Copiar a URL

Depois de implantar, aparece uma URL assim:

```
https://script.google.com/macros/s/AKfycbxxxxxxxxxxxxxxxxxxxxxxx/exec
```

**Copie ela.** (Se fechar a janela, vá em **Implantar** → **Gerenciar implantações**.)

## Passo 6 — Colocar no projeto

Abra o arquivo **`data.json`** e procure:

```json
"urlServidor": "",
"tokenServidor": "jenny-luiz-2026",
```

Cole sua URL entre as aspas:

```json
"urlServidor": "https://script.google.com/macros/s/AKfycb.../exec",
"tokenServidor": "jenny-luiz-2026",
```

## Passo 7 — Aplicar e publicar

No terminal, dentro da pasta do projeto:

```bash
python3 sincronizar.py
git add -A && git commit -m "Ativa sincronizacao" && git push
```

O Netlify publica sozinho em ~30 segundos.

## Passo 8 — Testar

1. Abra o site e reserve um número de teste
2. Abra o painel → o número deve aparecer em **"aguardando comprovante"**
3. No painel, clique em **✅ Confirmar pagamento**
4. Abra o site de novo (ou recarregue) → o número deve estar **confirmado**

Se funcionar, está pronto! 🎉

---

# 🔐 Trocar a senha (recomendado)

O `tokenServidor` protege sua planilha. O padrão é `jenny-luiz-2026`.

**Para trocar:**

1. No `Codigo.gs` (e no editor do Apps Script), mude:
   ```javascript
   var TOKEN = 'suaSenhaSecreta123';
   ```
2. Salve e **implante de novo** (Implantar → Gerenciar implantações → editar → Versão: Nova)
3. Troque o **mesmo valor** em `data.json` no campo `tokenServidor`
4. Rode `python3 sincronizar.py` e publique

---

# 📊 Como fica a planilha

| Data | Numeros | Nome | WhatsApp | Total | Status |
|---|---|---|---|---|---|
| 06/10 14:39 | 25 | William | (47) 99933-4946 | R$ 2,00 | aguardando |
| 06/10 14:45 | 30, 31 | Ana Paula | (48) 99958-9697 | R$ 4,00 | confirmado |

Você pode abrir a planilha a qualquer momento para ver tudo.

---

# ❓ Perguntas frequentes

**Preciso pagar?**
Não. Google Sheets e Apps Script são gratuitos.

**A pessoa precisa de conta Google?**
Não. Ela só usa o site normalmente.

**E se o site ficar sem internet?**
Continua funcionando — os números ficam salvos no navegador dela e o botão
"Copiar resumo" continua disponível.

**E se eu não configurar?**
O site funciona, mas cada visitante vê apenas o `data.json` que foi publicado.
Você precisaria baixar e subir o arquivo manualmente.

**Posso editar a planilha na mão?**
Pode, mas o jeito certo é pelo painel — assim o site reflete na hora.

**Como vejo se está funcionando?**
No painel, clique em **🔄 Buscar reservas do site**. Se aparecer algo, está conectado.

**Preciso reimplantar se mudar o código?**
Sim. Sempre que editar o `Codigo.gs`, vá em
**Implantar** → **Gerenciar implantações** → **editar (lápis)** →
**Versão: Nova versão** → **Implantar**.
