# 🏠 Gastos Residenciais

Sistema de controle de gastos residenciais com **WebAPI .NET 10** + **React + TypeScript**.

---

## Estrutura do Projeto

```
gastos-residenciais/
├── backend/
│   └── GastosResidenciais.API/
│       ├── Controllers/          # Endpoints REST
│       │   ├── PessoasController.cs
│       │   ├── CategoriasController.cs
│       │   ├── TransacoesController.cs
│       │   └── RelatoriosController.cs
│       ├── Data/
│       │   └── AppDbContext.cs   # EF Core + SQLite
│       ├── DTOs/
│       │   └── Dtos.cs           # Records de request/response
│       ├── Models/
│       │   ├── Pessoa.cs
│       │   ├── Categoria.cs
│       │   ├── Transacao.cs
│       │   └── Enums.cs
│       └── Program.cs            # Entry point + DI + CORS
│
└── frontend/
    └── src/
        ├── api/                  # Serviços de acesso à API
        │   ├── client.ts         # Axios configurado
        │   ├── pessoas.ts
        │   ├── categorias.ts
        │   └── transacoes.ts
        ├── pages/                # Páginas (uma por rota)
        │   ├── PessoasPage.tsx
        │   ├── CategoriasPage.tsx
        │   ├── TransacoesPage.tsx
        │   ├── RelatorioPessoaPage.tsx
        │   └── RelatorioCategoriaPage.tsx
        ├── components/
        │   └── Modal.tsx
        ├── types/index.ts        # Interfaces TypeScript (espelham os DTOs)
        ├── utils/format.ts       # Formatação de moeda e cores
        ├── styles/global.css
        ├── App.tsx               # Roteamento e layout
        └── main.tsx
```

---

## Como Executar

### Pré-requisitos
- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js 18+](https://nodejs.org)

### Back-end

```bash
cd backend/GastosResidenciais.API
dotnet restore
dotnet run
# API disponível em: http://localhost:5226
# Swagger UI:       http://localhost:5226/swagger
```

O banco SQLite (`gastos.db`) é criado automaticamente na primeira execução via `EnsureCreated()`.  
Os dados persistem entre reinicializações — basta não apagar o arquivo `gastos.db`.

### Front-end

```bash
cd frontend
npm install
npm run dev
# Aplicação em: http://localhost:5173
```

O Vite faz proxy de `/api` → `http://localhost:5000`, eliminando problemas de CORS em dev.

---

## Regras de Negócio

| Regra | Onde é aplicada |
|-------|----------------|
| Ao excluir uma pessoa, todas as suas transações são removidas | `AppDbContext` → `DeleteBehavior.Cascade` |
| Menor de 18 anos só pode ter transações de Despesa | `TransacoesController` + `TransacoesPage` (UX) |
| A Finalidade da Categoria deve ser compatível com o Tipo da Transação | `TransacoesController` + `CategoriasController.GetByTipo` |
| Valor da transação deve ser positivo | Data Annotation `[Range(0.01, ...)]` + validação no front |
| Nome: máx. 200 chars / Descrição: máx. 400 chars | Data Annotations + `maxLength` nos inputs |

---

## Endpoints da API

### Pessoas
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/pessoas` | Lista todas |
| GET | `/api/pessoas/{id}` | Busca por Id |
| POST | `/api/pessoas` | Cria |
| PUT | `/api/pessoas/{id}` | Atualiza |
| DELETE | `/api/pessoas/{id}` | Remove (cascade transações) |

### Categorias
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/categorias` | Lista todas |
| GET | `/api/categorias/por-tipo?tipo={1\|2}` | Filtra por compatibilidade com tipo de transação |
| POST | `/api/categorias` | Cria |

### Transações
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/transacoes` | Lista todas |
| GET | `/api/transacoes/por-pessoa/{id}` | Lista por pessoa |
| POST | `/api/transacoes` | Cria (com validação de regras) |

### Relatórios
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/relatorios/por-pessoa` | Totais por pessoa + total geral |
| GET | `/api/relatorios/por-categoria` | Totais por categoria + total geral |

---

## Persistência

Utiliza **SQLite** via Entity Framework Core.  
- Sem servidor externo: o banco é um único arquivo (`gastos.db`).
- Dados sobrevivem a reinicializações — o arquivo mantém o estado completo.
- Em produção, basta trocar a connection string por SQL Server / PostgreSQL sem alterar código.
