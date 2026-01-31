# Activity System

A comprehensive activity management system consisting of a Node.js/Express backend and a Vue 3 admin panel.

## Project Structure

- **server/**: Backend application built with Node.js, Express, and Prisma.
- **admin-panel/**: Frontend admin dashboard built with Vue 3 and Element Plus.

## Features

- **Activity Management**: Create, update, delete, and clone activities.
- **Category Management**: Organize tasks into categories (create, update, delete).
- **Task Management**: Configure tasks for each activity (Daily/Total limits, Points, Task Names).
- **Dashboard**: View activity statistics, leaderboards, and export data.
- **Internationalization (i18n)**: Bilingual support (English/Chinese) for the Admin Panel.
- **User Activity Tracking**: Track user points, task completions, and history.

## Prerequisites

- Node.js (v16+ recommended)
- npm or yarn

## Installation

### 1. Setup Backend (Server)

```bash
cd server
npm install
```

Configure environment variables in `server/.env` (if not present, create one based on requirements, default uses SQLite):

```env
DATABASE_URL="file:./dev.db"
```

Initialize the database:

```bash
npx prisma generate
npx prisma push --accept-data-loss # Or use migrate dev
```

### 2. Setup Frontend (Admin Panel)

```bash
cd admin-panel
npm install
```

## Running the Application

### Start the Server

```bash
cd server
npm start
```
The server will run on `http://localhost:3000` (default).

### Start the Admin Panel

```bash
cd admin-panel
npm run dev
```
The admin panel will be available at the URL provided by Vite (usually `http://localhost:5173`).

## API Documentation

See `client_api_docs.md` for detailed client-facing API documentation.

## Tech Stack

- **Backend**: Node.js, Express, Prisma, SQLite/PostgreSQL
- **Frontend**: Vue 3, Vite, Element Plus, Vue Router, Pinia/Vuex (if used), Axios
- **I18n**: Vue I18n
