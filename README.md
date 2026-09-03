# PB-TP4

Projeto de catálogo de produtos com microserviço de avaliações, organizado como um build multi-módulo Maven e integrado por eventos via RabbitMQ.

## Estrutura

```text
PB-TP4 (pom pai)
├── shared       contratos e mensagens compartilhadas
├── catalogo     serviço de catálogo de produtos
├── avaliacoes   serviço de avaliações de produtos
└── frontend     interface React com Vite
```

## Módulos

| Módulo | Porta | Responsabilidade |
|---|---:|---|
| `shared` | - | DTOs e contratos de mensagem |
| `catalogo` | 8090 | CRUD de produtos e categorias, histórico com Envers |
| `avaliacoes` | 8081 | CRUD de avaliações e consulta por produto |
| `frontend` | 5173 | Interface web do sistema |

## Integração

- `catalogo` publica eventos de produto em um `topic exchange` do RabbitMQ.
- `avaliacoes` consome os eventos e mantém uma cópia local do catálogo.
- O cadastro de avaliações valida o produto localmente antes de persistir.

## Mensageria

- Exchange: `catalogo.produtos.exchange`
- Eventos: `produto.criado`, `produto.atualizado`, `produto.excluido`
- Fila: `avaliacoes.catalogo.produtos.queue`

## Endpoints de avaliações

| Método | Caminho | Descrição |
|---|---|---|
| GET | `/avaliacoes` | Lista avaliações com filtros opcionais |
| GET | `/avaliacoes/{id}` | Busca por id |
| GET | `/avaliacoes/produtos/{produtoId}` | Lista avaliações de um produto |
| GET | `/avaliacoes/produtos/{produtoId}/media` | Média e total de avaliações |
| POST | `/avaliacoes` | Cria avaliação |
| PUT | `/avaliacoes/{id}` | Atualiza avaliação |
| DELETE | `/avaliacoes/{id}` | Remove avaliação |

## Como executar

Pré-requisitos: JDK 21, Maven 3.9+, Node.js e RabbitMQ.

1. Inicie os backends em terminais separados:

```bash
./mvnw -pl catalogo spring-boot:run
./mvnw -pl avaliacoes spring-boot:run
```

2. Inicie o frontend:

```bash
cd frontend
npm install
npm run dev
```

## Testes

```bash
./mvnw clean test
```

## Stack

- Spring Boot 4.0.6, Java 21, Spring AMQP
- Spring Data JPA, H2, Hibernate Envers
- React 19, Vite 8
