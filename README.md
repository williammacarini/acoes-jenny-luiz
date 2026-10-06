# 🎟️ Jenny & Luiz — Ações entre Amigos

Site completo e **100% gratuito** para ações entre amigos, hospedado no **GitHub Pages**.

---

## 📋 Configuração atual

| Item | Detalhe |
|------|---------|
| **Números** | 2.500 (de 1 a 2500) |
| **Valor** | R$ 2,00 por número |
| **Meta total** | R$ 5.000,00 |
| **1º prêmio** | Celular Samsung Galaxy A54 5G (seminovo) |
| **2º prêmio** | Fechadura Eletrônica Digital (biometria, senha, chave, cartão e App) |
| **3º prêmio** | R$ 100 no Pix |
| **Pix** | `b9b4a193-c097-41ae-8da1-007199e7e9c652` — Jennyfer Borba de Souza |
| **WhatsApp** | (48) 99958-9697 |
| **Sorteio** | A definir |
| **Senha do painel** | `PrGui123` |
| **Prazo da pré-reserva** | 2 horas |

---

## 📁 Arquivos do projeto

```
acoes-jenny-luiz/
├── index.html          → Página pública (o que todos veem)
├── admin.html          → Painel de controle (senha: PrGui123)
├── data.json           → Dados: números, prêmios, configurações
├── sincronizar.py      → Embute os dados no HTML (para abrir com duplo-clique)
├── COMO-CONFIGURAR.md  → Guia da sincronização com Google Sheets
├── google-apps-script/
│   └── Codigo.gs       → Código do servidor gratuito (Google Sheets)
├── assets/
│   ├── fechadura.jpg   → Foto do 2º prêmio
│   └── pix-qr.svg      → QR Code do Pix
└── README.md           → Este arquivo
```

> 💡 **Importante:** os dados ficam **embutidos** dentro do `index.html` e do `admin.html`.
> É por isso que o site funciona mesmo com **duplo-clique** no arquivo (sem servidor).
> O `data.json` é a "fonte da verdade" e o `sincronizar.py` copia esses dados para dentro dos HTMLs.

---

## ⚠️ Se você abrir o arquivo com duplo-clique

Funciona normalmente! Mas se você mudar o `data.json`, precisa rodar:

```bash
python3 sincronizar.py
```

para os dados novos entrarem no `index.html`. Sem isso, o arquivo aberto localmente
continua mostrando a versão antiga.

---

## 🚀 Publicar no GitHub Pages (grátis)

### 1. Criar conta no GitHub
Acesse [github.com](https://github.com) → **Sign up** (se ainda não tiver conta).

### 2. Criar o repositório
1. Clique no **+** (canto superior direito) → **New repository**
2. Nome sugerido: **`acoes-jenny-luiz`**
3. Marque **Public**
4. Clique em **Create repository**

### 3. Enviar os arquivos
No repositório, clique em **Add file → Upload files** e arraste:
- `index.html`
- `admin.html`
- `data.json`
- a pasta `assets` (com `fechadura.jpg` e `pix-qr.svg`)

Depois clique em **Commit changes**.

> ⚠️ **Importante:** a pasta `assets` precisa ser enviada junto, senão a foto da fechadura e o QR Code não aparecem.

### 4. Ativar o GitHub Pages
1. No repositório, vá em **Settings**
2. No menu lateral esquerdo, clique em **Pages**
3. Em **Source**, escolha **Deploy from a branch**
4. Branch: **main** — Pasta: **/ (root)**
5. Clique em **Save**
6. Aguarde 1–2 minutos

Seu site ficará em:
```
https://SEU-USUARIO.github.io/acoes-jenny-luiz/
```

O painel em:
```
https://SEU-USUARIO.github.io/acoes-jenny-luiz/admin.html
```

---

## 🔄 As reservas do site chegam no meu painel?

Um site estático **não** consegue enviar dados sozinho de um navegador para outro.
Existem duas soluções implementadas:

| Solução | Como funciona | Status |
|---|---|---|
| **A) Copiar e colar** | A pessoa clica em "Copiar resumo da reserva" e te manda no WhatsApp. Você cola no painel em "Colar reservas". | ✅ Pronto |
| **B) Google Sheets** | Automático: o site grava na sua planilha e o painel lê de lá. | ⚙️ 10 min para configurar |

📖 **Instruções completas:** veja o arquivo [COMO-CONFIGURAR.md](COMO-CONFIGURAR.md)

---

## 🎯 Como funciona (fluxo completo)

### Etapa 1 — A pessoa escolhe os números
1. Abre o link e vê os 3 prêmios
2. **Toca nos números que quiser** — pode escolher vários!
   - Cada número tocado fica **rosa com um check verde**
   - Tocar de novo desmarca
3. Assim que escolhe o primeiro, aparece uma **barra fixa no rodapé** mostrando:
   - Quantos números selecionou
   - Quais números
   - O total a pagar
   - Botões **Limpar** e **Pré-reservar**
4. Ao clicar em **Pré-reservar**, preenche **nome** e **WhatsApp** uma única vez

> 💡 **Não existe mais campo de quantidade** — a quantidade é exatamente a quantidade de números que a pessoa tocou na tela.

### Etapa 2 — O número fica pré-reservado (2 horas)
- O número fica **amarelo** para todos, com um indicador piscando
- O site avisa: *"pré-reservado no seu nome por 2 horas, aguardando comprovante"*
- A pessoa é levada ao WhatsApp com a mensagem já pronta (nome, número e total)

### Etapa 3 — A pessoa paga e envia o comprovante
- Paga o Pix (QR Code ou Copia e Cola)
- Manda o comprovante no WhatsApp **(48) 99958-9697**

### Etapa 4 — Você valida no painel
1. Abre o `admin.html` e entra com a senha
2. Vê a caixa **"X números aguardando comprovante"** com nome, WhatsApp, data e o tempo restante
3. Confere o comprovante e clica em **✅ Confirmar pagamento**
4. O número vira **verde confirmado** e fica salvo definitivamente
5. Se a pessoa não pagar, clique em **Liberar** para devolver o número

> 💡 O botão **WhatsApp** na lista de pendentes abre a conversa direto com a pessoa, já com o número 55 do Brasil.

### Status dos números

| Cor | Significado |
|-----|-------------|
| 🟢 Verde | Livre — pode escolher |
| 🟡 Amarelo (piscando) | Pré-reservado — aguardando comprovante |
| ⚪ Cinza | Confirmado — pagamento validado |

---

## 🔄 Atualizar o site depois de vender números

### Opção A — Publicado no GitHub Pages (mais fácil)
1. No painel, marque os números vendidos
2. Clique em **📥 Baixar data.json atualizado**
3. No GitHub, abra `data.json` → clique no **ícone de lápis** (Edit)
4. Apague tudo e cole o conteúdo do arquivo baixado
5. Clique em **Commit changes**
6. Em 1–2 minutos o site público atualiza sozinho ✅

### Opção B — Usando o arquivo local (duplo-clique)
1. No painel, marque os números vendidos
2. Clique em **📥 Baixar data.json atualizado**
3. Salve o arquivo na pasta do projeto, substituindo o `data.json`
4. Rode:

```bash
python3 sincronizar.py
```

5. Pronto — o `index.html` já mostra os números atualizados ✅

---

## ⚙️ O que você deve personalizar

### 1. Senha do painel (MUITO IMPORTANTE)
No arquivo `admin.html`, procure a linha:
```javascript
var SENHA = "admin123";          /* <-- TROQUE ESTA SENHA */
```
Troque `admin123` por uma senha só sua.

### 2. Textos e frases
No `data.json`, dentro do bloco `campanha`:
- `frases` → frases exibidas no topo (uma é sorteada a cada visita)
- `dataSorteio` → coloque a data quando definir

### 3. Prêmios
No `data.json`, em `campanha.premios`, você pode mudar títulos, descrições e detalhes.

---

## 💬 Divulgar no WhatsApp

Mensagem pronta para enviar aos amigos:

```
💕 *Jenny & Luiz — Ações entre Amigos* 💕

Vem ser o protagonista do nosso sonho! ❤️

🏆 Prêmios:
📱 1º — Celular Samsung Galaxy A54 5G
🔐 2º — Fechadura Eletrônica Digital
💸 3º — R$ 100 no Pix

🎟️ 2.500 números
💰 Apenas R$ 2,00 cada

Escolha seu número:
https://SEU-USUARIO.github.io/acoes-jenny-luiz/
```

---

## ❓ Perguntas frequentes

**Preciso pagar algo?**
Não. GitHub Pages é 100% gratuito, sem taxa e sem anúncios.

**Como recebo o dinheiro?**
O Pix cai direto na sua conta. Você confirma manualmente no painel.

**O QR Code funciona?**
Sim — foi gerado a partir do seu código Pix Copia e Cola (BR Code), com valor em aberto (a pessoa digita o valor no banco).

**E se eu errar ao marcar um número?**
Clique nele de novo no painel para liberar.

**O site é seguro?**
É um site estático. A senha do painel fica no código, então use uma senha única e não compartilhe o link do `admin.html`.

**Funciona no celular?**
Sim, o site é totalmente responsivo.

---

## 🔧 Tecnologias

- HTML5 + CSS3 + JavaScript puro (sem frameworks)
- Hospedagem: GitHub Pages (gratuito)
- Fonte: Google Fonts (Inter)
- QR Code: gerado do código Pix EMV (BR Code)
- Pagamento: Pix direto, sem intermediários
