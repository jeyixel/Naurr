# Naurr — Modern Gen Z Chat

Naurr is a modern, Discord-inspired chat app with a playful Gen Z UI. The current build is demo-ready: complete authentication, profile uploads, and friend management are in place. Real-time chat is the next (and only major) milestone.

## Status
- Feature-complete for auth and friends; ready for demos and local use.
- WebSockets + Redis for real-time messaging are planned next.

## Features
- Email/password signup with unique username and shareable friend code.
- Optional profile image upload via Cloudinary during signup.
- Secure auth with bcrypt + JWT stored in an HTTP-only cookie; `me`, logout, and account deletion included.
- Friend management: add by friend code (mutual), view friends list, regenerate your code.
- React + Vite frontend with dark, Gen Z-friendly styling and protected routes.
- Environment-aware cookies (HTTP in dev, HTTPS in production) and CORS preconfigured for the dev client.

## Tech stack
- Frontend: React + Vite + TypeScript
- Backend: Node.js + Express
- Database: MongoDB (Mongoose)
- Media: Cloudinary for avatar uploads
- Auth: JWT in HTTP-only cookies + bcrypt password hashing

---

## Prerequisites
- Node.js (v16+ recommended) and npm
- MongoDB (Atlas or local)
- (Optional) Redis server if you plan to add real-time pub/sub
- Cloudinary account for image uploads


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

## API quick reference
- POST `/api/auth/signup` — multipart/form-data; fields: `email`, `password`, `firstName`, `lastName`, `username`, optional file `profile-image`.
- POST `/api/auth/login` — JSON; fields: `email`, `username`, `password`; sets auth cookie.
- GET `/api/auth/me` — returns current user (requires auth cookie).
- POST `/api/auth/logout` — clears auth cookie.
- PUT `/api/auth/regenerate-code` — issues a new friend code for the authenticated user.
- DELETE `/api/auth/delete-account` — deletes the authenticated user (best-effort Cloudinary cleanup).
- GET `/api/friends` — returns the authenticated user’s friends.
- POST `/api/friends/add` — JSON; field: `friendCode`; creates mutual friendship.

## CORS / Cookies
- Server CORS is set to `http://localhost:5173` with `credentials: true`. Update in `server/index.js` if your client origin changes.
- Cookies use `httpOnly`. In development (`NODE_ENV !== 'production'`) they are sent with `sameSite: 'lax'` and `secure: false` so they work over HTTP. In production, `secure` and `sameSite: 'none'` are used—run behind HTTPS.

## Roadmap
- WebSockets for real-time chat
- Redis for pub/sub and horizontal scaling
- Channels, typing indicators, and richer chat UI

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

## Troubleshooting
- Duplicate key error when signing up: email or username is already in the DB. Use a different value or remove the duplicate.
- `JWT_SECRET` missing: server will throw when creating tokens. Ensure `.env` has it.
- Cloudinary errors: confirm keys and that the upload request contains the `profile-image` file field.

---

## License & Notes
This is a personal project built for fun and learning. No production guarantees—harden and review before production use.

If you want, I can also:
- Add a demo script to seed the DB with test users
- Provide a Postman collection export
- Scaffold the WebSocket + Redis integration next

Enjoy building Naurr! 🎉
