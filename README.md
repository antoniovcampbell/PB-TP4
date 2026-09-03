# PB-TP3

Projeto de **catálogo de produtos com um microserviço de avaliações**, estruturado como um build **multi-módulo Maven** e refatorado para **arquitetura orientada a eventos** com RabbitMQ.

## Arquitetura (Microserviços)

```text
PB-TP3 (pom pai / agregador)
├── shared       # Contratos (DTOs) compartilhados entre os serviços
├── catalogo     # Serviço de catálogo de produtos (existente, porta 8080)
├── avaliacoes   # NOVO microserviço de avaliações de produtos (porta 8081)
└── frontend     # SPA React (Vite), consumindo os dois serviços
```

### Módulos

| Módulo       | Porta | Responsabilidade                                                              |
|--------------|-------|-------------------------------------------------------------------------------|
| `shared`     | -     | DTOs `ProdutoDTO` e `AvaliacaoDTO` — contrato entre os serviços              |
| `catalogo`   | 8080  | CRUD de produtos e categorias, histórico (Hibernate Envers)                   |
| `avaliacoes` | 8081  | Novas avaliações (nota 1–5, comentário) por produto                           |
| `frontend`   | 5173  | Interface React que integra ambos os serviços                                 |

### Comunicação entre serviços (Event-Driven)

- O módulo `catalogo` publica eventos de produto em um **topic exchange** do RabbitMQ.
- O módulo `avaliacoes` consome esses eventos e mantém um **espelho local** do catálogo.
- A criação de avaliações passa a validar o produto no cache local, reduzindo o acoplamento síncrono entre serviços.
- O módulo `shared` concentra os contratos de mensagem (`EventoProduto`, `TipoEventoProduto` e constantes do broker).

### Prós e contras

- Prós: menor acoplamento, melhor resiliência, escalabilidade e isolamento de falhas.
- Contras: consistência eventual, maior complexidade operacional e necessidade de tratar reentrega/duplicidade de mensagens.

### Padrão de mensagens

- `catalogo.produtos.exchange` como `topic exchange`.
- Eventos `produto.criado`, `produto.atualizado` e `produto.excluido`.
- A fila `avaliacoes.catalogo.produtos.queue` consome todos os eventos de produto.

### Endpoints do microserviço de avaliações (`/avaliacoes`, porta 8081)

| Método | Caminho                          | Descrição                                    |
|--------|----------------------------------|----------------------------------------------|
| GET    | `/avaliacoes`                    | Lista (filtros: `produtoId`, `nota`)         |
| GET    | `/avaliacoes/{id}`               | Busca por id                                 |
| GET    | `/avaliacoes/produtos/{produtoId}` | Avaliações de um produto                   |
| GET    | `/avaliacoes/produtos/{produtoId}/media` | Média e total de avaliações   |
| POST   | `/avaliacoes`                    | Cria avaliação (valida produto no catálogo local)  |
| PUT    | `/avaliacoes/{id}`               | Atualiza avaliação                           |
| DELETE | `/avaliacoes/{id}`               | Remove avaliação                             |

## Como executar

Pré-requisitos: JDK 21, Maven 3.9+ (`mvnw` incluso), Node.js, RabbitMQ na porta 5672.

1. Suba os serviços backend (em janelas/terminais separados):

```bash
# catálogo (porta 8080)
./mvnw -pl catalogo spring-boot:run

# avaliações (porta 8081) — depende apenas do RabbitMQ para sincronizar eventos
./mvnw -pl avaliacoes spring-boot:run
```

2. Suba o front-end:

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
```

## Testes

```bash
./mvnw clean test
```

- `catalogo`: repositórios e serviços de produto/categoria/histórico (39 testes).
- `avaliacoes`: repositório, serviço e controller (`@WebMvcTest`, 25 testes).

## Stack

- Spring Boot 4.0.6, Spring AMQP/RabbitMQ, Java 21
- Spring Data JPA + H2, Hibernate Envers (auditoria no catálogo)
- React 19 + Vite 8 (front-end)
