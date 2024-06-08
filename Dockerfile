# Estágio 1: Compilar o código TypeScript
FROM node:16 as builder

WORKDIR /app

# Copiar apenas os arquivos de dependências e .env para aproveitar o cache do Docker
COPY package*.json ./

RUN npm install

# Copiar o restante dos arquivos e compilar o projeto
COPY . .

RUN npm run build

# Verificar se os arquivos foram gerados no diretório dist
RUN ls -l /app/dist

# Estágio 2: Copiar o código compilado e instalar apenas as dependências de produção
FROM node:16

WORKDIR /app

# Copiar o diretório dist gerado no estágio de build
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.env ./

# Instalar apenas dependências de produção
RUN npm install --only=production

EXPOSE 3000

CMD ["node", "dist/src/main"]  # Ajustado para corresponder ao caminho correto
