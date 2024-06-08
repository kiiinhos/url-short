# Projeto de Encurtador de URLs

## Visão Geral

Este projeto é um sistema de encurtador de URLs com funcionalidades de autenticação, gerenciamento de usuários e contabilização de acessos.

## Funcionalidades

- **Versão 0.1.0**: Encurtador de URLs criado
- **Versão 0.2.0**: Autenticação implementada
- **Versão 0.3.0**: Operações de usuário no encurtador
- **Versão 0.4.0**: Contabilização de acessos aos URLs encurtados

## Como Rodar o Projeto

### Pré-requisitos

- Node.js (versão >=14.0.0 <18.0.0)
- Docker (opcional, para rodar com Docker)

### Instalação

1. Clone o repositório:
    ```bash
    git clone <URL_DO_REPOSITORIO>
    cd <NOME_DO_REPOSITORIO>
    ```

2. Instale as dependências:
    ```bash
    npm install
    ```

Configure as variáveis de ambiente:
    - Renomeie o arquivo `.env.example` para `.env`.

    
    DB_HOST=localhost
    DB_PORT=5432
    DB_USERNAME=seu_usuario
    DB_PASSWORD=sua_senha
    DB_NAME=nome_do_banco

    JWT_SECRET=sua_chave_secreta

    OBSERVABILITY_ENABLED=true
    ELASTICSEARCH_URL=http://localhost:9200
    JAEGER_URL=http://localhost:14268/api/traces
    
### Acessando a Documentação Swagger

Depois de iniciar o servidor, você pode acessar a documentação da API Swagger no seguinte URL:
```
http://localhost:3000/api
```
### Rodando o Projeto

#### Localmente

1. Inicie o servidor:
    ```bash
    npm run start:dev
    ```

#### Usando Docker

1. Construa e inicie os containers:
    ```bash
    docker-compose up --build
    ```

## Endpoints

### Autenticação e Usuário

- **POST /api/auth/register**: Registrar Usuário
    - Request body: `{ "username": "example", "password": "password123" }`
    - Response: `{ "id": "user_id", "username": "example" }`

- **POST /api/auth/login**: Login
    - Request body: `{ "username": "example", "password": "password123" }`
    - Response: `{ "access_token": "jwt_token" }`

### Encurtador de URL

- **POST /api/shorten**: Encurtar URL
    - Request body: `{ "url": "https://example.com" }`
    - Response: `{ "shortUrl": "http://localhost:3000/<shortId>" }`

- **GET /api/urls**: Listar URLs do Usuário
    - Response: `[{ "id": "url_id", "originalUrl": "https://example.com", "shortUrl": "http://localhost:3000/<shortId>" }]`

- **PUT /api/urls/:id**: Atualizar URL
    - Request body: `{ "url": "https://newexample.com" }`
    - Response: `{ "id": "url_id", "originalUrl": "https://newexample.com", "shortUrl": "http://localhost:3000/<shortId>" }`

- **DELETE /api/urls/:id**: Deletar URL
    - Response: `{ "message": "URL deletada com sucesso" }`

- **GET /:shortId**: Redirecionar para URL Original
    - Redireciona para o URL de origem e contabiliza o acesso.

## Observabilidade

Este projeto possui suporte para observabilidade usando Elasticsearch e Jaeger. Para configurar, use as seguintes variáveis de ambiente no arquivo `.env`:

- **OBSERVABILITY_ENABLED**: Ativa/desativa a observabilidade. Use `true` para ativar e `false` para desativar.
- **ELASTICSEARCH_URL**: URL do serviço Elasticsearch.
- **JAEGER_URL**: URL do serviço Jaeger.

Exemplo de configuração:

```
OBSERVABILITY_ENABLED=true
ELASTICSEARCH_URL=http://localhost:9200
JAEGER_URL=http://localhost:14268/api/traces
```
## Estrutura do Projeto

### Arquivos Principais

- `package.json`: Contém informações sobre as dependências e scripts do projeto.
- `src/app.module.ts`: Módulo principal da aplicação.
- `src/main.ts`: Arquivo de inicialização da aplicação.
- `src/config/database.config.ts`: Configuração do banco de dados.
- `docker-compose.yml`: Arquivo de configuração do Docker Compose.

### Módulos e Serviços

- **AuthModule**: Módulo de autenticação.
- **UsersModule**: Módulo de gerenciamento de usuários.
- **UrlsModule**: Módulo de gerenciamento de URLs encurtadas.
- **LoggerModule**: Módulo de logging.

## Contribuindo

1. Fork este repositório.
2. Crie uma branch para sua feature:
    ```bash
    git checkout -b minha-nova-feature
    ```
3. Commit suas mudanças:
    ```bash
    git commit -m "feat: adiciona minha nova feature"
    ```
4. Envie sua branch:
    ```bash
    git push origin minha-nova-feature
    ```
5. Abra um Pull Request.

## Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo LICENSE para mais detalhes.
