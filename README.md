Login API scaffold

Quick start

1. Install dependencies

```bash
npm install
```

2. Run the server

```bash
npm start
```

API

- POST /api/auth/login
  - body: { "email": "admin@example.com", "password": "password123" }
  - returns: { token, user }

Note: Set `JWT_SECRET` in `.env` for production.

Register

- POST /api/auth/register
  - body: { "email": "you@example.com", "password": "secret", "name": "Your Name" }
  - returns: created `user` without password

Protected route example

- GET /api/protected
  - require header: `Authorization: Bearer <token>`
  - returns: protected content and `user` info

