# PetFind

Projeto fullstack com Next.js (frontend), Express (backend) e PostgreSQL.

## Estrutura

- `backend` → API (auth, pets, matches, mensagens, upload)
- `frontend` → aplicação Next.js (UI e navegação)
- `docker-compose.yml` → banco local (Postgres + Adminer)

## Stack

- Frontend: Next.js 14, React 18, Axios, Tailwind CSS
- Backend: Express 4, Sequelize, PostgreSQL, Zod, JWT em cookie HttpOnly

## Setup rápido (Windows / PowerShell)

### 1) Banco de dados (Docker)

```powershell
docker-compose up -d
```

- Postgres: `127.0.0.1:5433`
- Adminer: `http://localhost:8080`
	- Server: `db`
	- User: `postgres`
	- Password: `postgres`
	- Database: `petfind`

### 2) Backend

```powershell
cd backend
npm install
Copy-Item .env.example .env.local
npm run db:migrate
npm run dev
```

### 3) Frontend

```powershell
cd frontend
npm install
npm run dev
```

## Variáveis de ambiente (backend)

Arquivo: `backend/.env.local`

```dotenv
DATABASE_URL=postgres://postgres:postgres@127.0.0.1:5433/petfind
JWT_SECRET=your_secret_key_here
FRONTEND_URLS=http://localhost:5423
```

`FRONTEND_URLS` aceita múltiplas origens separadas por vírgula.

Exemplo:

```dotenv
FRONTEND_URLS=http://localhost:5423,http://localhost:3000
```

## Portas padrão

- Backend: `http://localhost:4000`
- Frontend: `http://localhost:5423`

## Uploads de imagens

- Diretório local: `backend/public/uploads`
- Arquivos servidos em: `http://localhost:4000/uploads/<arquivo>`

## Páginas do frontend

- `/`
- `/login`
- `/register`
- `/pets`
- `/pet-register`
- `/pet-edit`
- `/pet-details`
- `/matches`
- `/match-begin`
- `/match-display`
- `/chat`
- `/chat-on`
- `/chat-off`
- `/tutor-profile`
- `/tutor-edit`
- `/settings/match`
- `/settings/notifications`
- `/settings/privacy`
- `/settings/support`

## Fluxo funcional (resumo)

1. Registrar usuário em `/register`
2. Login em `/login`
3. Cadastrar pet em `/pet-register`
4. Definir pet ativo (persistido no navegador)
5. Curtir perfis em `/match-display`
6. Quando houver match, conversar em `/chat-on`

## Endpoints da API

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`

### Usuário

- `GET /api/me`
- `PUT /api/me`

### Pets

- `GET /api/pets`
- `POST /api/pets`
- `GET /api/pets/:id`
- `PUT /api/pets/:id`
- `DELETE /api/pets/:id`
- `POST /api/pets/:id/like`

### Matches e chat

- `GET /api/matches`
- `GET /api/matches/unread/count`
- `GET /api/matches/:id/messages`
- `POST /api/matches/:id/messages`
- `PUT /api/matches/:id/messages/read`

## Exemplo de resposta de like com match

`POST /api/pets/:id/like`

```json
{
	"message": "Match created",
	"matched": true,
	"match": {
		"id": 1,
		"petAId": 10,
		"petBId": 20,
		"status": "active",
		"createdAt": "2026-02-03T10:00:00.000Z",
		"updatedAt": "2026-02-03T10:00:00.000Z"
	}
}
```

## Melhorias implementadas (UX, UI e comportamento)

### UX / UI

- Padronização visual de páginas e botões para manter harmonia de estilo
- Redesign de telas de perfil e fluxo de match
- `match-display` com visual de story:
	- múltiplas imagens por pet
	- barra de progresso por imagem
	- auto-avanço em ~10s
	- navegação lateral (anterior/próxima)
	- pausa ao segurar
- Skeleton de carregamento em telas de match

### Chat e notificações

- Ajuste de sincronização da conversa entre contas
- Polling periódico no chat para atualização de mensagens
- Correção da lógica de “mensagem enviada x recebida” por usuário logado
- Contador de mensagens não lidas
- Marcação de mensagens como lidas ao entrar na conversa

### Robustez de frontend

- Interceptor global da API para erros de autenticação/servidor
- Toast global para feedback de ações e erros
- Confirmações de ações sensíveis via modal customizado (sem `alert/confirm` nativo)

## Troubleshooting

### `npm run dev` falha no backend

Checklist rápido:

1. Confirmar `backend/.env.local` existente
2. Validar `DATABASE_URL` e `JWT_SECRET`
3. Garantir containers ativos: `docker-compose ps`
4. Rodar migrations novamente: `npm run db:migrate`
5. Verificar se a porta `4000` está livre

### Erro de CORS

- Ajustar `FRONTEND_URLS` no `backend/.env.local`
- Reiniciar backend após alteração

## Scripts úteis

### Backend

- `npm run dev`
- `npm run start`
- `npm run db:migrate`
- `npm run db:migrate:undo`

### Frontend

- `npm run dev`
- `npm run build`
- `npm run start`

## Próximos passos sugeridos

- Documentação OpenAPI/Swagger para a API
- Testes de integração para auth, pets, likes e chat
- Upload em storage externo (S3/GCS)
