# CrickView

A real-time cricket scoreboard application built with Next.js, MongoDB, Redis, and Socket.IO.

## Features

- **Start a Match**: Create new cricket matches with team information
- **Ball-by-ball Commentary**: Add detailed commentary for each ball
- **Real-time Updates**: Live updates using Socket.IO
- **Match Management**: Pause/resume functionality for matches
- **Auto-increment Match IDs**: 4-digit unique match identifiers
- **Redis Caching**: Latest 10 commentary entries cached in redis for performance

## Tech Stack (As Required)

- **Backend**: Next.js API Routes, TypeScript, MongoDB, Redis, Socket.IO
- **Frontend**: React with Next.js


## Backend Endpoints

### 1. Start a Match
- ✅ **Endpoint**: `POST /api/matches/start`
- ✅ **Accepts**: team and match information
- ✅ **Generates**: 4-digit unique match ID using auto-increment counter
- ✅ **Uses**: both `_id` (MongoDB ObjectId) and `matchId` (4-digit) as per PDF

### 2. Add Commentary  
- ✅ **Endpoint**: `POST /api/matches/:id/commentary`
- ✅ **Adds**: commentary for a specific ball
- ✅ **Fields**: over, ball, event type (run, wicket, wide, etc.) as required

## Frontend

- ✅ **Real-time updates** using Socket.IO
- ✅ **Match creation form**
- ✅ **Live scoreboard display**
- ✅ **Commentary feed**

## Real-time Communication

- ✅ **Socket.IO** for live updates
- ✅ **Emit commentary updates** to all connected clients
- ✅ **Handle match state changes**

## Database Schema

- ✅ **MongoDB** for persistent storage
- ✅ **Auto-increment match ID logic** using counters collection with `_id: "matchId"`
- ✅ **Redis** for caching

## More Features

- ✅ **Pause/resume functionality** for matches
- ✅ **Store and retrieve latest 10 commentary entries** from Redis cache


## Database Collections

### matches
\`\`\`json
{
  "_id": ObjectId("..."),
  "matchId": "0001", // 4-digit auto-increment
  "team1": "India",
  "team2": "Australia", 
  "status": "active",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
\`\`\`

### commentary
\`\`\`json
{
  "_id": ObjectId("..."),
  "matchId": "0001",
  "over": 1,
  "ball": 1,
  "eventType": "run", // run, wicket, wide, etc.
  "description": "Great shot through covers",
  "runs": 4,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
\`\`\`

### counters
\`\`\`json
{
  "_id": "matchId", // As per PDF requirement
  "sequence": 1
}
\`\`\`

## Setup Instructions

### Prerequisites
- Node.js 18+ 
- MongoDB (local or cloud)
- Redis (local or cloud)

1. **Install dependencies**
\`\`\`bash
npm install
\`\`\`

2. **Environment Variables**
Create a `.env.local` file in the root directory:
\`\`\`env
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=cricket_scoring
REDIS_URL=redis://localhost:6379
WS_URL
\`\`\`

3. **Start services**
\`\`\`bash
# MongoDB
mongod

# Redis  
redis-server

# Application
npm run dev
\`\`\`


# Coming Soon - Docker Instructions
