# Formato de Resposta do N8N

## Resposta Esperada

O N8N deve retornar a resposta no campo `output`:

```json
{
  "output": "Sua resposta aqui..."
}
```

## Processamento Automático

O sistema DigestAI automaticamente:

1. Extrai o conteúdo do campo `output`
2. Remove toda formatação markdown
3. Converte para texto limpo

## Exemplos

### Exemplo 1: Resposta Simples

N8N retorna:
```json
{
  "output": "## Análise dos Sintomas\n\nBaseado nos seus **sintomas recentes**, recomendo:\n\n* Evitar laticínios\n* Beber mais água\n* Fazer exercícios leves"
}
```

Usuário recebe (limpo):
```
Análise dos Sintomas

Baseado nos seus sintomas recentes, recomendo:

Evitar laticínios
Beber mais água
Fazer exercícios leves
```

### Exemplo 2: Resposta com Formatação

N8N retorna:
```json
{
  "output": "**Atenção!** Você apresenta sintomas de intolerância à lactose.\n\n### Recomendações:\n- Evite leite\n- Experimente `leite vegetal`\n- Consulte um médico"
}
```

Usuário recebe (limpo):
```
Atenção! Você apresenta sintomas de intolerância à lactose.

Recomendações:
Evite leite
Experimente leite vegetal
Consulte um médico
```

## Markdown Removido

O sistema remove automaticamente:

- Headers: `#`, `##`, `###`, etc
- Bold: `**texto**` ou `__texto__`
- Italic: `*texto*` ou `_texto_`
- Code blocks: ` ```código``` `
- Inline code: `` `código` ``
- Links: `[texto](url)`
- Imagens: `![alt](url)`
- Listas: `*` ou `-` no início
- Blockquotes: `>`
- Linhas horizontais: `---`, `***`, `___`

## Teste

Para testar:

```bash
curl -X POST https://n8n.produtohub.store/webhook/agenteia-intestinal \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Teste",
    "userId": "123"
  }'
```

Resposta esperada:
```json
{
  "output": "Olá! Como posso ajudar você hoje?"
}
```

## Campos Opcionais

Você pode adicionar campos extras (serão ignorados):

```json
{
  "output": "Resposta principal",
  "suggestions": ["Sugestão 1", "Sugestão 2"],
  "insights": [...],
  "metadata": {...}
}
```

Mas apenas `output` é obrigatório e será usado como mensagem principal.
