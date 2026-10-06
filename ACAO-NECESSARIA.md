# ⚠️ AÇÃO NECESSÁRIA: Reimplantar o código do Apps Script

## O que aconteceu

Você reservou os números **1 e 240**. Depois liberou o **1** no painel — e o **240 também desapareceu**.

**Não foi erro seu.** É um bug no código que está rodando na sua planilha.

---

## Por que acontece

Os números 1 e 240 foram salvos **na mesma linha** da planilha:

| Data | Numeros | Nome | WhatsApp | Total | Status |
|---|---|---|---|---|---|
| 06/10 | **1, 240** | Gui | (47) 99933-4946 | R$ 4,00 | aguardando |

O código **antigo** fazia assim:

```javascript
if (a linha contém QUALQUER número da lista) {
    APAGA A LINHA INTEIRA     // ← BUG
}
```

Então ao liberar o `1`, ele apagava a linha toda — e o `240` ia junto.

**O mesmo vale para confirmar:** confirmar o `1` confirmava o `240` também.

---

## ✅ Já corrigi o código

O arquivo `google-apps-script/Codigo.gs` agora:

- **Libera** apenas o número pedido (se a linha tem outros, eles ficam)
- **Confirma** apenas o número pedido
- **Divide a linha** automaticamente quando necessário

**Falta só reimplantar.** São 2 minutos.

---

# 📋 PASSO A PASSO

## 1. Abra o Apps Script

1. Abra sua planilha: [Reservas Jenny & Luiz](https://docs.google.com/spreadsheets/d/1dI2f2_1PxFacofv8DDps_XvOCh7iQ1T1LIejMsvowhI/edit)
2. Menu **Extensões** → **Apps Script**

## 2. Substitua o código

1. No editor, clique dentro do código
2. Selecione tudo: `Ctrl+A` (Windows) ou `Cmd+A` (Mac)
3. Apague: `Delete`
4. Abra o arquivo **`google-apps-script/Codigo.gs`** desta pasta
5. Copie **tudo** (`Ctrl+C`)
6. Cole no editor (`Ctrl+V`)
7. Salve: `Ctrl+S`

> 💡 O arquivo tem 357 linhas. A primeira linha é `/**` e a última é `}`.

## 3. Reimplante (IMPORTANTE)

1. Clique em **Implantar** → **Gerenciar implantações**
2. Na implantação existente, clique no **ícone de lápis** ✏️
3. Em **Versão**, escolha **Nova versão**
4. Clique em **Implantar**

> ⚠️ **Não crie uma implantação nova** — apenas edite a existente.
> Assim a URL continua a mesma e nada precisa ser reconfigurado.

## 4. Pronto!

A URL **não muda**. Não precisa mexer no site.

---

# 🧪 Como testar depois

1. Reserve **3 números de uma vez** (ex: 10, 20, 30)
2. No painel, clique em **Liberar** no número 10
3. Confirme no modal
4. **Os números 20 e 30 devem continuar reservados** ✅

Antes, todos os três desapareceriam.

---

# 🎁 Melhorias que vêm junto

Além da correção, você ganha:

### Botão de confirmação antes de liberar

Agora ao clicar em **Liberar**, aparece um aviso:

```
⚠️  Liberar o número 10?

Participante: Gui Silva
Status atual: Aguardando comprovante

Ao liberar, o número volta a ficar livre para todos
e os dados do participante são apagados.

[Cancelar]  [Sim, liberar]
```

- Se o número estiver **já pago**, aparece um **segundo aviso** mais forte
- O botão **"Limpar todos"** também pede confirmação mostrando quantos serão apagados
- O botão **"Confirmar TODOS"** mostra a lista antes de agir

---

# ❓ Dúvidas

**Vou perder as reservas que já tenho?**
Não. O código novo lê a mesma planilha. Nada é apagado na reimplantação.

**Preciso refazer a configuração da URL?**
Não. A URL é a mesma — só o código por trás muda.

**E se eu errar ao colar o código?**
É só repetir o passo 2 e 3. Não tem risco de quebrar nada.

**Como sei que funcionou?**
Faça o teste do passo "Como testar depois". Se os outros números sobreviverem, funcionou.
