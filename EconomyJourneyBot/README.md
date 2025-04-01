# Bot de Economia Discord

Um bot de economia para Discord leve e otimizado (<100 MB) com sistema administrativo para gerenciamento de moedas e loja de cargos.

## Funcionalidades

- **Sistema Administrativo**: Comandos exclusivos para administradores adicionarem ou removerem moedas
- **Ranking de Usuários**: Visualização dos usuários com mais moedas no servidor
- **Loja de Cargos**: Sistema que permite aos usuários comprarem cargos utilizando suas moedas
- **Otimizado para Performance**: Consumo reduzido de memória e processamento

## Comandos

- `j?addmoney @usuario quantia` - Adiciona moedas ao usuário mencionado (apenas admins)
- `j?rmoney @usuario quantia` - Remove moedas do usuário mencionado (apenas admins)
- `j?rank` - Exibe ranking dos usuários com mais moedas (apenas admins)
- `j?loja` - Abre a loja de cargos (todos os usuários)

## Configuração

O bot utiliza um arquivo `config.js` para gerenciar suas configurações:

- **Prefixo do bot**: Configurado como "j?"
- **IDs de Administradores**: Lista de IDs que podem utilizar comandos administrativos
- **Cargos da loja**: Configuração dos cargos, seus IDs e preços
- **Token do Discord**: Configurado diretamente no arquivo para hospedagem na Discloud

## Otimizações Implementadas

Este bot foi otimizado para ser extremamente leve (<100 MB) e ter alta performance:

1. **Carregamento sob demanda**: Comandos são carregados apenas quando necessários
2. **Sistema de cache otimizado**: Gerenciamento eficiente de memória para embeds e mensagens
3. **Banco de dados com buffer**: Operações de salvamento agregadas para reduzir I/O no disco
4. **Limpeza automática de memória**: Sistema de sweepers para limpar mensagens antigas
5. **Arquivos estáticos pré-definidos**: Menus e componentes reutilizáveis

## Segurança

- Apenas os IDs de administrador configurados podem usar comandos para modificar saldos
- O token do bot é armazenado de forma segura
- O bot é privado e não pode ser adicionado a outros servidores

## Requisitos Técnicos

- Node.js v16 ou superior
- Discord.js v13
- Tamanho total <100 MB para hospedagem na Discloud

## Hospedagem na Discloud

Este bot está pronto para hospedagem na Discloud:

1. Certifique-se de que seu token esteja configurado no arquivo `config.js`
2. Comprima (zip) apenas os arquivos essenciais do bot:
   - pastas `commands` e `utils`
   - arquivos `index.js`, `config.js`, `database.json`, `discloud.config` e `package.json`
   - o arquivo de imagem `generated-icon.png`
3. Faça upload do arquivo .zip no painel da Discloud
4. O bot iniciará automaticamente após o processo de upload

Consulte a [documentação oficial da Discloud](https://docs.discloudbot.com/) para mais informações sobre como hospedar seu bot.

## Manutenção e Tamanho do Bot

Para manter o bot abaixo de 100 MB:
- Use o arquivo `.gitignore` fornecido para evitar adicionar arquivos desnecessários
- Evite instalar dependências não essenciais
- Remova arquivos temporários e logs regularmente
- Considere limitar o tamanho do banco de dados `database.json` se ele crescer muito