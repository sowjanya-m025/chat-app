# 💬 Chat App

A simple real-time messaging application built with **Node.js**, **Express**, and **Socket.IO**, with optional **MongoDB** persistence through Mongoose.

## Features

- Real-time message delivery to all connected browser clients
- Choose a display name
- Shows recent chat history to new connections
- Responsive chat interface for desktop and mobile
- Message and username length validation on the server
- Optional MongoDB storage for persistent messages
- In-memory fallback when MongoDB is not configured or unavailable
- Health-check endpoint at `/health`

> This is a learning/demo project. It does not currently include accounts, private rooms, authentication, or end-to-end encryption. Messages in the default chat are visible to all connected users.

## Technology Stack

- Node.js
- Express
- Socket.IO
- MongoDB and Mongoose (optional)
- dotenv
- HTML and CSS

## Project Structure

```text
chat-app/
├── client/
│   └── index.html
├── server/
│   └── index.js
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

## Prerequisites

- Node.js (LTS recommended) and npm
- MongoDB Community Server or a MongoDB connection string, only if persistent storage is wanted

Check your installation:

```bash
node --version
npm --version
```

## Run locally

### 1. Clone the repository

```bash
git clone https://github.com/sowjanya-m025/chat-app.git
cd chat-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the server

**Quick start without MongoDB:**

```bash
npm start
```

The server runs in memory-only mode if `MONGODB_URI` is not set. Messages are lost when the server restarts.

### 4. Open the app

Visit [http://localhost:3000](http://localhost:3000).

To test real-time messaging, open the same URL in two browser tabs or windows and send messages from each.

## Enable MongoDB persistence (optional)

1. Start your local MongoDB service, or create a MongoDB database connection string.
2. Copy `.env.example` to `.env`.
3. Ensure the `MONGODB_URI` in `.env` points to your database.

Example local configuration:

```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/chatapp
```

Then start the app:

```bash
npm start
```

Do not commit `.env` or any credentials to GitHub. The `.gitignore` excludes `.env` by default.

If MongoDB cannot be reached, the server logs a warning and starts in memory-only mode.

## Useful endpoints and commands

- App: `http://localhost:3000`
- Health check: `http://localhost:3000/health`
- Start: `npm start`
- Development mode (Node.js with `--watch` support): `npm run dev`

## Troubleshooting

**Port 3000 is already in use**

Set a different port in `.env`, for example `PORT=3001`, then restart the server.

**The page opens but messages do not send**

- Check the terminal for server errors.
- Confirm the server is running.
- Refresh the browser and check that the status indicator says “Connected”.

**Messages disappear after restarting**

This is expected in memory-only mode. Configure MongoDB to keep messages between restarts.

## Future Improvements

- User registration and login
- Private chat rooms
- Online user list
- Typing indicators
- Message timestamps and delivery status
- Automated tests
- Authentication, authorization, rate limiting, and stronger production security

## Author

**Sowjanya M**

GitHub: [@sowjanya-m025](https://github.com/sowjanya-m025)

## License

This project is licensed under the ISC license.
