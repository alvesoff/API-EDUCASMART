# API EducaSmart

Sistema de gerenciamento educacional com foco em provas online, gerenciamento de alunos, professores e avaliações.

## Sumário

- [Visão Geral](#visão-geral)
- [Instalação](#instalação)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Rotas da API](#rotas-da-api)
  - [Usuários](#usuários)
  - [Provas](#provas)
  - [Resultados](#resultados)
  - [Questões Pessoais](#questões-pessoais)
  - [Turmas](#turmas)
- [Autenticação](#autenticação)
- [Modelo de Dados](#modelo-de-dados)
- [Exemplos de Requisições e Respostas](#exemplos-de-requisições-e-respostas)
  - [Resultados](#exemplos-resultados)
  - [Estatísticas](#exemplos-estatísticas)
  - [Turmas](#exemplos-turmas)

## Visão Geral

O EducaSmart é uma plataforma completa para instituições de ensino gerenciarem provas, avaliações e acompanharem o desempenho de seus alunos. O sistema permite que professores criem provas, atribuam a turmas específicas e acompanhem os resultados dos alunos em tempo real.

### Principais recursos

- Cadastro de usuários (alunos, professores, administradores)
- Criação e gestão de provas
- Realização de provas online
- Acompanhamento de resultados e estatísticas
- Sistema de autenticação seguro
- Gerenciamento de turmas

## Instalação

```bash
# Clonar o repositório
git clone https://github.com/seu-usuario/API-EDUCASMART.git
cd API-EDUCASMART

# Instalar dependências
npm install

# Configurar variáveis de ambiente
# Criar um arquivo .env com as seguintes variáveis:
# - MONGO_URI=sua_conexao_mongodb
# - JWT_SECRET=seu_segredo_jwt
# - PORT=5000 (ou a porta desejada)

# Iniciar o servidor em desenvolvimento
npm run dev

# Iniciar o servidor em produção
npm start
```

## Estrutura do Projeto

```
API-EDUCASMART/
├── config/             # Configurações (banco de dados, variáveis de ambiente)
├── controllers/        # Controladores da aplicação
├── middleware/         # Middleware (autenticação, validação)
├── models/             # Modelos de dados (schemas do MongoDB)
├── routes/             # Definição das rotas da API
├── server.js           # Ponto de entrada da aplicação
└── package.json        # Dependências e scripts do projeto
```

## Rotas da API

### Usuários

| Método | Rota                  | Descrição                   | Acesso            |
|--------|----------------------|-----------------------------|--------------------|
| POST   | /api/usuarios/registro | Registrar novo usuário      | Público           |
| POST   | /api/usuarios/login    | Autenticar usuário          | Público           |
| GET    | /api/usuarios/me       | Obter perfil de usuário     | Privado           |
| GET    | /api/usuarios          | Listar todos os usuários    | Admin             |
| GET    | /api/usuarios/:id      | Obter usuário específico    | Admin/Professor   |
| PUT    | /api/usuarios/:id      | Atualizar usuário           | Admin/Usuário     |
| DELETE | /api/usuarios/:id      | Remover usuário             | Admin             |

### Provas

| Método | Rota                    | Descrição                     | Acesso           |
|--------|------------------------|-----------------------------|-------------------|
| POST   | /api/provas             | Criar nova prova             | Professor         |
| GET    | /api/provas             | Listar todas as provas       | Professor/Admin   |
| GET    | /api/provas/:id         | Obter prova específica       | Professor/Aluno   |
| PUT    | /api/provas/:id         | Atualizar prova              | Professor         |
| DELETE | /api/provas/:id         | Remover prova                | Professor         |
| GET    | /api/provas/codigo/:codigo | Obter prova por código    | Aluno/Professor   |
| GET    | /api/provas/turma/:turma   | Listar provas por turma   | Aluno/Professor   |

### Resultados

| Método | Rota                                | Descrição                             | Acesso            |
|--------|------------------------------------|-------------------------------------|-------------------|
| POST   | /api/resultados/registrar-acesso    | Registrar acesso à prova              | Público           |
| POST   | /api/resultados/iniciar             | Iniciar realização de prova           | Aluno             |
| PUT    | /api/resultados/responder           | Submeter resposta de questão          | Aluno             |
| PUT    | /api/resultados/finalizar           | Finalizar prova                       | Público           |
| GET    | /api/resultados                     | Listar todos os resultados            | Professor/Admin   |
| GET    | /api/resultados/:id                 | Obter resultado específico            | Aluno/Professor   |
| GET    | /api/resultados/aluno/:alunoId      | Listar resultados de um aluno         | Aluno/Professor   |
| GET    | /api/resultados/prova/:provaId      | Listar resultados de uma prova        | Professor         |
| GET    | /api/resultados/codigo/:codigoProva | Listar resultados por código da prova | Professor/Admin   |
| GET    | /api/resultados/estatisticas/:provaId | Obter estatísticas de uma prova     | Professor         |
| GET    | /api/resultados/turma/:turma        | Listar resultados por turma           | Professor/Admin   |
| GET    | /api/resultados/ranking/:provaId    | Obter ranking de alunos em uma prova  | Professor         |
| GET    | /api/resultados/dashboard/professor | Estatísticas do professor             | Professor         |
| GET    | /api/resultados/dashboard/aluno     | Estatísticas do aluno                 | Aluno             |
| GET    | /api/resultados/disciplina/:disciplina | Resultados por disciplina          | Professor/Admin   |
| GET    | /api/resultados/periodo             | Resultados por período                | Professor/Admin   |

### Questões Pessoais

| Método | Rota                      | Descrição                       | Acesso           |
|--------|--------------------------|-----------------------------|-------------------|
| POST   | /api/questoes-pessoais     | Criar nova questão pessoal     | Professor         |
| GET    | /api/questoes-pessoais     | Listar questões pessoais       | Professor         |
| GET    | /api/questoes-pessoais/:id | Obter questão pessoal específica| Professor        |
| PUT    | /api/questoes-pessoais/:id | Atualizar questão pessoal      | Professor         |
| DELETE | /api/questoes-pessoais/:id | Remover questão pessoal        | Professor         |

### Turmas

| Método | Rota                  | Descrição                      | Acesso             |
|--------|----------------------|------------------------------|---------------------|
| POST   | /api/turmas           | Criar nova turma              | Admin/Professor     |
| GET    | /api/turmas           | Listar todas as turmas        | Admin/Professor     |
| GET    | /api/turmas/:id       | Obter turma específica        | Admin/Professor     |
| PUT    | /api/turmas/:id       | Atualizar turma               | Admin/Professor     |
| DELETE | /api/turmas/:id       | Remover turma                 | Admin               |
| GET    | /api/turmas/serie/:serie | Listar turmas por série     | Admin/Professor     |
| POST   | /api/turmas/:id/alunos | Adicionar alunos à turma      | Admin/Professor     |
| DELETE | /api/turmas/:id/alunos/:alunoId | Remover aluno da turma | Admin/Professor  |
| GET    | /api/turmas/:id/alunos | Listar alunos da turma        | Admin/Professor     |
| GET    | /api/turmas/:id/provas | Listar provas da turma        | Admin/Professor     |
| GET    | /api/turmas/:id/estatisticas | Obter estatísticas da turma | Admin/Professor |

## Autenticação

A autenticação é realizada através de JWT (JSON Web Tokens). O token deve ser incluído no cabeçalho das requisições que exigem autenticação:

```
Authorization: Bearer <token>
```

O token é obtido através da rota de login e tem validade configurável (padrão de 24 horas).

## Modelo de Dados

### Usuário
- `nome`: String (obrigatório)
- `email`: String (obrigatório, único)
- `senha`: String (obrigatório)
- `tipo`: String ('aluno', 'professor', 'admin')
- `turma`: String (para alunos)
- `disciplinas`: Array (para professores)
- `serie`: String (para alunos)
- `dataRegistro`: Date

### Prova
- `titulo`: String (obrigatório)
- `descricao`: String
- `disciplina`: String (obrigatório)
- `serie`: String (obrigatório)
- `turmas`: Array de Strings
- `professor`: ObjectId (referência ao usuário)
- `questoes`: Array de objetos Questão
- `dataInicio`: Date
- `dataFim`: Date
- `duracao`: Number (em minutos)
- `codigo`: String (único)
- `status`: String ('rascunho', 'publicada', 'encerrada')

### Resultado
- `aluno`: ObjectId (referência ao usuário)
- `prova`: ObjectId (referência à prova)
- `nomeAluno`: String
- `turma`: String
- `codigoProva`: String
- `respostas`: Array de objetos Resposta
  - `questao`: Number (índice da questão)
  - `alternativaSelecionada`: Number (índice da alternativa)
  - `correta`: Boolean
  - `pontuacao`: Number
- `pontuacaoTotal`: Number
- `percentualAcerto`: Number
- `dataInicio`: Date
- `dataFim`: Date
- `tempoGasto`: Number (em minutos)
- `status`: String ('em_andamento', 'finalizado')

### Questão Pessoal
- `professor`: ObjectId (referência ao usuário)
- `disciplina`: String
- `enunciado`: String
- `alternativas`: Array de objetos Alternativa
  - `texto`: String
  - `correta`: Boolean
- `nivel`: String ('fácil', 'médio', 'difícil')
- `tipo`: String ('múltipla escolha', 'verdadeiro ou falso')
- `tags`: Array de Strings

### Turma
- `nome`: String (obrigatório)
- `serie`: String (obrigatório)
- `anoLetivo`: Number (obrigatório)
- `professorResponsavel`: ObjectId (referência ao usuário)
- `alunos`: Array de ObjectId (referência a usuários)
- `disciplinas`: Array de Strings
- `status`: String ('ativa', 'inativa')
- `codigo`: String (único)

## Exemplos de Requisições e Respostas

<a name="exemplos-resultados"></a>
### Resultados

#### Listar todos os resultados
```
GET /api/resultados
```

**Resposta:**
```json
{
  "success": true,
  "count": 2,
  "total": 2,
  "totalPages": 1,
  "currentPage": 1,
  "data": [
    {
      "_id": "6123def789abc456",
      "aluno": {
        "_id": "5678abc123def456",
        "nome": "João Silva",
        "email": "joao@exemplo.com",
        "turma": "5A"
      },
      "prova": {
        "_id": "6123abc456def789",
        "titulo": "Prova de Matemática - Frações",
        "disciplina": "Matemática",
        "serie": "5º ano"
      },
      "pontuacaoTotal": 80,
      "percentualAcerto": 80,
      "dataInicio": "2023-09-10T14:30:00.000Z",
      "dataFim": "2023-09-10T15:20:00.000Z",
      "tempoGasto": 50,
      "status": "finalizado"
    },
    {
      "_id": "6123def789abc457",
      "aluno": {
        "_id": "5678abc123def457",
        "nome": "Maria Oliveira",
        "email": "maria@exemplo.com",
        "turma": "5A"
      },
      "prova": {
        "_id": "6123abc456def789",
        "titulo": "Prova de Matemática - Frações",
        "disciplina": "Matemática",
        "serie": "5º ano"
      },
      "pontuacaoTotal": 90,
      "percentualAcerto": 90,
      "dataInicio": "2023-09-10T14:35:00.000Z",
      "dataFim": "2023-09-10T15:15:00.000Z",
      "tempoGasto": 40,
      "status": "finalizado"
    }
  ]
}
```

#### Obter resultado específico
```
GET /api/resultados/6123def789abc456
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "_id": "6123def789abc456",
    "aluno": {
      "_id": "5678abc123def456",
      "nome": "João Silva",
      "email": "joao@exemplo.com",
      "turma": "5A"
    },
    "prova": {
      "_id": "6123abc456def789",
      "titulo": "Prova de Matemática - Frações",
      "disciplina": "Matemática",
      "serie": "5º ano",
      "questoes": [
        {
          "enunciado": "Qual é o resultado de 1/4 + 1/2?",
          "alternativas": [
            { "texto": "1/6", "correta": false },
            { "texto": "3/4", "correta": true },
            { "texto": "2/6", "correta": false },
            { "texto": "1/8", "correta": false }
          ],
          "pontuacao": 10
        },
        {
          "enunciado": "Quanto é 1/3 de 60?",
          "alternativas": [
            { "texto": "15", "correta": false },
            { "texto": "20", "correta": true },
            { "texto": "30", "correta": false },
            { "texto": "40", "correta": false }
          ],
          "pontuacao": 10
        }
      ]
    },
    "respostas": [
      {
        "questao": 0,
        "alternativaSelecionada": 1,
        "correta": true,
        "pontuacao": 10
      },
      {
        "questao": 1,
        "alternativaSelecionada": 1,
        "correta": true,
        "pontuacao": 10
      }
    ],
    "pontuacaoTotal": 20,
    "percentualAcerto": 100,
    "dataInicio": "2023-09-10T14:30:00.000Z",
    "dataFim": "2023-09-10T15:20:00.000Z",
    "tempoGasto": 50,
    "status": "finalizado"
  }
}
```

#### Listar resultados por código da prova
```
GET /api/resultados/codigo/MATH2023
```

**Resposta:**
```json
{
  "success": true,
  "count": 2,
  "total": 2,
  "totalPages": 1,
  "currentPage": 1,
  "data": [
    {
      "_id": "6123def789abc456",
      "aluno": {
        "_id": "5678abc123def456",
        "nome": "João Silva",
        "email": "joao@exemplo.com",
        "turma": "5A"
      },
      "codigoProva": "MATH2023",
      "pontuacaoTotal": 80,
      "percentualAcerto": 80,
      "dataInicio": "2023-09-10T14:30:00.000Z",
      "dataFim": "2023-09-10T15:20:00.000Z",
      "tempoGasto": 50,
      "status": "finalizado"
    },
    {
      "_id": "6123def789abc457",
      "aluno": {
        "_id": "5678abc123def457",
        "nome": "Maria Oliveira",
        "email": "maria@exemplo.com",
        "turma": "5A"
      },
      "codigoProva": "MATH2023",
      "pontuacaoTotal": 90,
      "percentualAcerto": 90,
      "dataInicio": "2023-09-10T14:35:00.000Z",
      "dataFim": "2023-09-10T15:15:00.000Z",
      "tempoGasto": 40,
      "status": "finalizado"
    }
  ]
}
```

#### Listar resultados por turma
```
GET /api/resultados/turma/5A
```

**Resposta:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "6123def789abc456",
      "aluno": {
        "_id": "5678abc123def456",
        "nome": "João Silva"
      },
      "prova": {
        "_id": "6123abc456def789",
        "titulo": "Prova de Matemática - Frações",
        "disciplina": "Matemática"
      },
      "turma": "5A",
      "pontuacaoTotal": 80,
      "percentualAcerto": 80,
      "status": "finalizado"
    },
    {
      "_id": "6123def789abc457",
      "aluno": {
        "_id": "5678abc123def457",
        "nome": "Maria Oliveira"
      },
      "prova": {
        "_id": "6123abc456def789",
        "titulo": "Prova de Matemática - Frações",
        "disciplina": "Matemática"
      },
      "turma": "5A",
      "pontuacaoTotal": 90,
      "percentualAcerto": 90,
      "status": "finalizado"
    }
  ]
}
```

<a name="exemplos-estatisticas"></a>
### Estatísticas

#### Estatísticas de uma prova
```
GET /api/resultados/estatisticas/6123abc456def789
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "totalAlunos": 30,
    "mediaAcertos": 75.5,
    "mediaTempo": 45,
    "distribuicaoNotas": [
      { "faixa": "0-20%", "quantidade": 2 },
      { "faixa": "21-40%", "quantidade": 3 },
      { "faixa": "41-60%", "quantidade": 5 },
      { "faixa": "61-80%", "quantidade": 10 },
      { "faixa": "81-100%", "quantidade": 10 }
    ],
    "questoesAcertos": [
      {
        "questaoIndex": 0,
        "enunciado": "Qual é o resultado de 1/4 + 1/2?",
        "totalRespostas": 30,
        "acertos": 25,
        "percentualAcerto": 83.33
      },
      {
        "questaoIndex": 1,
        "enunciado": "Quanto é 1/3 de 60?",
        "totalRespostas": 30,
        "acertos": 22,
        "percentualAcerto": 73.33
      }
    ]
  }
}
```

#### Ranking de alunos em uma prova
```
GET /api/resultados/ranking/6123abc456def789
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "prova": {
      "_id": "6123abc456def789",
      "titulo": "Prova de Matemática - Frações",
      "disciplina": "Matemática"
    },
    "ranking": [
      {
        "posicao": 1,
        "aluno": {
          "_id": "5678abc123def457",
          "nome": "Maria Oliveira",
          "turma": "5A"
        },
        "pontuacaoTotal": 90,
        "percentualAcerto": 90,
        "tempoGasto": 40
      },
      {
        "posicao": 2,
        "aluno": {
          "_id": "5678abc123def456",
          "nome": "João Silva",
          "turma": "5A"
        },
        "pontuacaoTotal": 80,
        "percentualAcerto": 80,
        "tempoGasto": 50
      }
    ]
  }
}
```

#### Dashboard do professor
```
GET /api/resultados/dashboard/professor
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "totalProvas": 10,
    "totalAlunosAvaliados": 150,
    "mediaGeral": 78.5,
    "provasRecentes": [
      {
        "_id": "6123abc456def789",
        "titulo": "Prova de Matemática - Frações",
        "disciplina": "Matemática",
        "totalAlunos": 30,
        "mediaAcertos": 75.5
      }
    ],
    "disciplinas": [
      {
        "nome": "Matemática",
        "provas": 5,
        "mediaAcertos": 72.3
      },
      {
        "nome": "Português",
        "provas": 3,
        "mediaAcertos": 81.7
      },
      {
        "nome": "Ciências",
        "provas": 2,
        "mediaAcertos": 79.2
      }
    ]
  }
}
```

#### Resultados por disciplina
```
GET /api/resultados/disciplina/Matemática
```

**Resposta:**
```json
{
  "success": true,
  "count": 2,
  "data": {
    "disciplina": "Matemática",
    "provas": [
      {
        "_id": "6123abc456def789",
        "titulo": "Prova de Matemática - Frações",
        "serie": "5º ano",
        "totalAlunos": 30,
        "mediaAcertos": 75.5
      },
      {
        "_id": "6123abc456def790",
        "titulo": "Prova de Matemática - Decimais",
        "serie": "5º ano",
        "totalAlunos": 28,
        "mediaAcertos": 68.2
      }
    ],
    "mediaGeral": 71.85
  }
}
```

<a name="exemplos-turmas"></a>
### Turmas

#### Criar nova turma
```
POST /api/turmas
```

**Corpo da requisição:**
```json
{
  "nome": "5A",
  "serie": "5º ano",
  "anoLetivo": 2023,
  "professorResponsavel": "6123abc456def123",
  "disciplinas": ["Matemática", "Português", "Ciências"],
  "status": "ativa"
}
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "_id": "7123abc456def123",
    "nome": "5A",
    "serie": "5º ano",
    "anoLetivo": 2023,
    "professorResponsavel": "6123abc456def123",
    "alunos": [],
    "disciplinas": ["Matemática", "Português", "Ciências"],
    "status": "ativa",
    "codigo": "5A-2023"
  }
}
```

#### Listar alunos da turma
```
GET /api/turmas/7123abc456def123/alunos
```

**Resposta:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "5678abc123def456",
      "nome": "João Silva",
      "email": "joao@exemplo.com",
      "tipo": "aluno"
    },
    {
      "_id": "5678abc123def457",
      "nome": "Maria Oliveira",
      "email": "maria@exemplo.com",
      "tipo": "aluno"
    }
  ]
}
```

#### Obter estatísticas da turma
```
GET /api/turmas/7123abc456def123/estatisticas
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "turma": {
      "_id": "7123abc456def123",
      "nome": "5A",
      "serie": "5º ano"
    },
    "totalAlunos": 30,
    "totalProvas": 8,
    "mediaGeral": 76.4,
    "desempenhoProvas": [
      {
        "prova": {
          "_id": "6123abc456def789",
          "titulo": "Prova de Matemática - Frações",
          "disciplina": "Matemática"
        },
        "mediaAcertos": 75.5,
        "alunosParticipantes": 30,
        "data": "2023-09-10"
      },
      {
        "prova": {
          "_id": "6123abc456def790",
          "titulo": "Prova de Português - Verbos",
          "disciplina": "Português"
        },
        "mediaAcertos": 81.2,
        "alunosParticipantes": 28,
        "data": "2023-09-15"
      }
    ],
    "desempenhoPorDisciplina": [
      {
        "disciplina": "Matemática",
        "mediaAcertos": 72.3,
        "provas": 4
      },
      {
        "disciplina": "Português",
        "mediaAcertos": 81.7,
        "provas": 3
      },
      {
        "disciplina": "Ciências",
        "mediaAcertos": 79.2,
        "provas": 1
      }
    ],
    "alunosDestaque": [
      {
        "aluno": {
          "_id": "5678abc123def457",
          "nome": "Maria Oliveira"
        },
        "mediaGeral": 92.5
      },
      {
        "aluno": {
          "_id": "5678abc123def456",
          "nome": "João Silva"
        },
        "mediaGeral": 88.3
      }
    ]
  }
} 