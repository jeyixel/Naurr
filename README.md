# Naurr — Modern Gen Z Chat (Prototype)

Naurr is a small personal project: a Discord-like modern chat app prototype built for fun. It uses a Node/Express backend with MongoDB for users, Cloudinary for profile image uploads, and cookies for session JWTs. The plan is to integrate WebSockets and Redis later for real-time messaging and scaling.

> This repository is a work-in-progress prototype — intended for learning and experimentation.

## Features (current)
- Email/password signup + optional profile image upload (Cloudinary)
- JWT stored in an HTTP-only cookie
- Login / Signup UI (React + Vite) with dark, Gen Z-friendly styling
- Protected `/me` endpoint to return current user

## Planned
- WebSockets for real-time chat
- Redis for pub/sub + session/scale support
- More chat UI and channels

---

## Prerequisites
- Node.js (v16+ recommended) and npm
- MongoDB (Atlas or local)
- (Optional) Redis server if you plan to add real-time pub/sub
- Cloudinary account for image uploads

---

## Repository layout
- `server/` — Express backend
- `client/` — React + Vite frontend

---

## Environment variables
Create a `.env` file in `server/` with the following values:

```
DB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/naurr?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_here
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
PORT=5000
```

Notes:
- `DB_URI` — MongoDB connection string (Atlas or local `mongodb://localhost:27017/naurr`).
- `JWT_SECRET` — pick a long random string used to sign JWTs.
- Cloudinary keys are required only if uploading profile images.

---

## Setup and run (local)
1. Server

```bash
cd server
npm install
# create .env (see above)
node index.js
# or use nodemon if installed
# npx nodemon index.js
```

2. Client

```bash
cd client
npm install
npm run dev
# open http://localhost:5173
```

The server defaults to `http://localhost:5000` and the client dev server runs at `http://localhost:5173`.

---

## Testing the API (Postman / curl)
- Signup (multipart/form-data)
  - POST `http://localhost:5000/api/auth/signup`
  - Body: form-data with `email`, `password`, `firstName`, `lastName` and file field `profile-image`
  - Response: user object and `Set-Cookie: jwt=...`

- Login (JSON)
  - POST `http://localhost:5000/api/auth/login`
  - Body (JSON): `{ "email": "...", "password": "..." }`
  - Response: user object and cookie set

- Check session
  - GET `http://localhost:5000/api/auth/me` (send cookie)

Notes for Postman: make sure Postman saves/sends cookies (Cookies dialog) or include `Cookie: jwt=<token>` header manually.

---

## CORS / Cookies
- The server uses CORS with `credentials: true` for the dev client origin. If you change origins, update `server/index.js` `app.use(cors({ origin: 'http://localhost:5173', credentials: true }))`.
- Cookies are `httpOnly` and `secure` in production. In development (`NODE_ENV !== 'production'`) cookies are sent with `sameSite: 'lax'` and `secure: false` so they work over HTTP.
- For production, run server behind HTTPS so `secure` cookies are set.

---

## Cloudinary
1. Create a free Cloudinary account.
2. From the dashboard, copy `cloud_name`, `api_key`, and `api_secret` and add them to `.env`.
3. The server uploads images (signup) using the `profile-image` field.

---

## MongoDB
- Quick (Atlas): create a cluster, whitelist your IP or use 0.0.0.0/0 for testing, create a database user, copy the connection string and set `DB_URI`.
- Local: start MongoDB locally and use `mongodb://localhost:27017/naurr` as `DB_URI`.

---

## Redis & WebSockets (future)
- Redis will be used for pub/sub and scaling across multiple server instances.
- For local testing, install Redis and run it locally, or use a managed Redis provider.
- WebSocket server (socket.io or ws) will be added to the backend and integrated with Redis for scaling.

---

## Troubleshooting
- Duplicate key error when signing up: means the email (or unique field) is already in the DB. Remove the duplicate or use a different email.
- `JWT_SECRET` missing: server will throw when creating tokens. Ensure `.env` has it.
- Cloudinary errors: confirm the keys and that the upload request contains the file field `profile-image`.

---

## License & Notes
This is a personal project built for fun and learning. No production guarantees—be mindful of security and hardening before using in production.

If you want, I can also:
- Add a demo script to seed the DB with test users
- Provide a Postman collection export
- Scaffold the WebSocket + Redis integration next

Enjoy building Naurr! 🎉
