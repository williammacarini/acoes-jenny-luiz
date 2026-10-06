# 🔄 Como fazer a reserva do site aparecer no seu painel

## Por que isso não funciona sozinho?

O site e o painel são **arquivos estáticos** (HTML). Quando alguém reserva um número:

- Os dados ficam salvos **no navegador daquela pessoa** (`localStorage`)
- O painel que **você** abre é outro navegador, em outro computador
- **Os dois nunca se conversam** — é uma limitação técnica de sites estáticos

Para resolver, precisamos de um **ponto central na nuvem** que os dois acessem.

---

## ✅ Duas soluções (use uma ou as duas)

| Solução | Como funciona | Esforço |
|---|---|---|
| **A) Copiar e colar** | A pessoa clica em "Copiar resumo" e te manda no WhatsApp. Você cola no painel. | ✅ Já está pronto |
| **B) Google Sheets** | Automático: o site grava na sua planilha e o painel lê de lá. | ⏱️ 10 min para configurar |

---

# 🅰️ SOLUÇÃO A — Copiar e colar (já funciona!)

**Nada para configurar.** Já está no ar.

### O que a pessoa faz:
1. Escolhe os números no site
2. Preenche nome e WhatsApp
3. Clica em **"📋 Copiar resumo da reserva"**
4. Cola no WhatsApp e te envia

O texto que chega é assim:
```
RESERVA|5,10,15|Maria Silva|(48) 99958-9697|R$ 6,00
```

### O que você faz:
1. Abre o painel (`admin.html`)
2. Clica em **"📥 Colar reservas"**
3. Cola **uma ou várias linhas** de uma vez
4. Clica em **Processar**

Os números são marcados como **"aguardando comprovante"** automaticamente, com o nome e o WhatsApp da pessoa.

> 💡 Se 3 pessoas te mandarem o resumo, cole as 3 linhas juntas — o painel processa todas.

---

# 🅱️ SOLUÇÃO B — Google Sheets (automático)

Quando alguém reservar no site, aparece **sozinho** no seu painel.

## Passo 1 — Criar a planilha

1. Acesse [sheets.google.com](https://sheets.google.com)
2. Clique em **+ Em branco** para criar uma planilha
3. Dê um nome: **Reservas Jenny & Luiz**

## Passo 2 — Abrir o editor de código

1. No menu da planilha, clique em **Extensões** → **Apps Script**
2. Abre uma nova aba com um editor de código

## Passo 3 — Colar o código

1. **Apague tudo** que estiver no editor
2. Abra o arquivo `google-apps-script/Codigo.gs` desta pasta
3. Copie **todo** o conteúdo e cole no editor
4. Clique no ícone de **disquete** (💾) ou `Ctrl+S` para salvar

## Passo 4 — Publicar como serviço web

1. No canto superior direito, clique em **Implantar** → **Nova implantação**
2. Clique na engrenagem ⚙️ ao lado de "Selecionar tipo" → escolha **App da Web**
3. Preencha:
   - **Descrição:** `Reservas`
   - **Executar como:** **Eu** (seu email)
   - **Quem pode acessar:** **Qualquer pessoa**
4. Clique em **Implantar**

> ⚠️ O Google vai pedir autorização. Clique em **Autorizar acesso** → escolha sua conta → **Avançado** → **Ir para... (não seguro)** → **Permitir**.
> Isso é normal: o Google avisa porque o script é seu, não de terceiros.

5. **Copie a URL** que aparece. Ela termina com `/exec` e é parecida com:
```
https://script.google.com/macros/s/AKfycbx.../exec
```

## Passo 5 — Colocar a URL no projeto

Abra o arquivo **`data.json`** e procure estas linhas:

```json
"urlServidor": "",
"tokenServidor": "jenny-luiz-2026",
```

Cole a sua URL entre as aspas:

```json
"urlServidor": "https://script.google.com/macros/s/AKfycbx.../exec",
"tokenServidor": "jenny-luiz-2026",
```

## Passo 6 — Sincronizar e publicar

No terminal, dentro da pasta do projeto:

```bash
python3 sincronizar.py
```

Depois envie para o GitHub: `data.json`, `index.html` e `admin.html`.

## Passo 7 — Testar

1. Abra o **painel** → clique em **"🔄 Buscar reservas do site"**
2. Faça uma reserva de teste no site
3. Clique em **Buscar reservas do site** novamente
4. O número deve aparecer como **aguardando comprovante** ✅

---

## 🔐 Sobre o token

O `tokenServidor` é uma senha simples que impede que estranhos leiam sua planilha.

**Recomendo trocar.** No arquivo `google-apps-script/Codigo.gs`, procure:

```javascript
var TOKEN = 'jenny-luiz-2026';
```

Troque por algo só seu, por exemplo:
```javascript
var TOKEN = 'jennyLuiz@2026xyz';
```

Depois troque o **mesmo valor** em `data.json` (campo `tokenServidor`), salve, rode
`python3 sincronizar.py` e publique novamente.

---

## ❓ Perguntas frequentes

**Preciso pagar algo?**
Não. Google Sheets e Apps Script são gratuitos, com limite generoso (muito acima do que você precisa).

**E se eu não configurar o Google Sheets?**
O site continua funcionando normalmente. Você só vai usar a Solução A (copiar e colar).

**A pessoa precisa de conta Google?**
Não. Ela só usa o site normalmente.

**E se a internet cair na hora da reserva?**
O site continua funcionando localmente — os números ficam pré-reservados no navegador dela, e o botão "Copiar resumo" continua disponível.

**Como vejo o que está na planilha?**
Abra a planilha no Google Sheets. Cada reserva vira uma linha com data, números, nome, WhatsApp, total e status.

**Posso marcar o pagamento direto na planilha?**
Pode, mas o jeito certo é pelo painel — assim o site continua mostrando o status correto para todos.
