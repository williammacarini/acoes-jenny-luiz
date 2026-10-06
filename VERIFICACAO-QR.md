# ✅ Verificação do QR Code Pix

**Data da verificação:** 06/10/2026

## Resultado: o QR Code está CORRETO

O QR Code do site foi decodificado e contém exatamente o código Pix oficial
fornecido pelo aplicativo do banco.

## Código verificado

```
00020126580014BR.GOV.BCB.PIX0136b9b4a193-c097-41ae-8da1-007199e7e9c65204000053039865802BR5923Jennyfer Borba de Souza6009SAO PAULO621405101dy9IWXPtC63041272
```

## Validações feitas

| Item | Resultado |
|---|---|
| Estrutura EMV (campo a campo) | ✅ Todos os campos fecham exatamente |
| CRC16 | ✅ 1272 confere |
| Chave Pix | ✅ `b9b4a193-c097-41ae-8da1-007199e7e9c6` (36 caracteres) |
| QR decodificado | ✅ Contém o código exato |
| Nome do beneficiário | ✅ Jennyfer Borba de Souza |
| Cidade | ✅ SAO PAULO |

## Estrutura do código

| Campo | Descrição | Conteúdo |
|---|---|---|
| `00` | Formato do payload | `01` |
| `26` | Conta Pix | `BR.GOV.BCB.PIX` + chave |
| `52` | Categoria do comerciante | `0000` |
| `53` | Moeda | `986` (BRL) |
| `58` | País | `BR` |
| `59` | Nome do beneficiário | Jennyfer Borba de Souza |
| `60` | Cidade | SAO PAULO |
| `62` | Dados adicionais | `05101dy9IWXPtC` |
| `63` | CRC16 | `1272` |

## Histórico

Houve uma tentativa de "correção" que alterou `0136` para `0138`, baseada
em uma leitura equivocada do código. **Essa alteração estava errada** e foi
revertida no commit `dafc5eb`.

O código original do banco está íntegro e é o que está publicado.
