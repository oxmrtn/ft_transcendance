*This project has been created as part of the 42 curriculum by qsomarri, jpiech, mtrullar, ebengtss.*

---

# VersuSCode

## Description
**VersuSCode** is a multiplayer coding game where players solve programming challenges in fewer than 3 attempts. Each incorrect submission costs a life, and after 3 failures, the game is lost.

**Goal:** Improve coding skills under pressure with real-time feedback and competitive gameplay.

**Key Features:**
- Multiplayer coding challenges (e.g., implement `strlen` in C)
- Real-time code evaluation and feedback
- Life system (3 attempts per challenge)
- Leaderboard and player rankings

---

## Team Information

| Login      | Role(s)                | Responsibilities                                  |
|------------|------------------------|----------------------------------------------------|
| qsomarri   | Project Manager, Developer | Task coordination, social system, WebSocket game logic |
| jpiech     | Technical Lead, Developer  | Containerization, authentication, sandbox, backend |
| ebengtss   | Product Owner, Developer  | Frontend (Next.js), Nginx, internationalization    |
| mtrullar   | Product Owner, Developer  | Database schema, ORM, gamification, auth backend  |

---

## Project Management
- **Organization:** Weekly meetings + Discord for daily updates
- **Tools:** GitHub (protected branch, pull requests), Notion (task tracking)
- **Communication:** Discord

---

## Technical Stack
- **Frontend:** Next.js (Single Page Application)
- **Backend:** NestJS (modular architecture)
- **Database:** PostgreSQL (reliable, relational)
- **ORM:** Prisma (type-safe database access, auto-migrations)
- **Other Tools:** Docker (deployment), Nginx (reverse proxy), Docker-in-Docker (sandbox)

---

## Database Schema
<img width="1528" height="933" alt="DB_scheme" src="https://github.com/user-attachments/assets/b28957c2-b22d-460e-baa0-e9f919cb3e5b" />

---

## Features List

| Feature                          | Team Member(s) | Description                                      |
|----------------------------------|----------------|--------------------------------------------------|
| Containerization & Deployment    | jpiech         | Dockerized application for consistency           |
| JWT Authentication               | jpiech         | Secure user authentication                       |
| Frontend (Next.js SPA)           | ebengtss       | Entire frontend application                      |
| Database Schema & ORM            | mtrullar       | PostgreSQL + Prisma implementation               |
| Social System                    | qsomarri       | Friends, chat, lobbies, profile management       |
| Game statistics                  | mtrullar       | XP, achievements, leaderboard, history           |
| WebSocket Game Logic             | qsomarri       | Real-time multiplayer interactions               |
| Sandbox Implementation           | jpiech         | Secure code execution via Docker-in-Docker       |
| Code submission logic            | mtrullar       | Execute code in sandbox from backend server      |

---

## Modules

### Web
| Module                          | Type   | Points | Team Member(s) |
|---------------------------------|--------|--------|----------------|
| Frameworks (Next.js, NestJS)    | Major  | 2      | ebengtss, jpiech |
| Real-time WebSockets            | Major  | 2      | qsomarri, jpiech |
| ORM (Prisma)                    | Minor  | 1      | mtrullar       |
| User Interaction                | Major  | 2      | qsomarri       |
| Custom Design System            | Minor  | 1      | ebengtss       |

### Gaming
| Module                          | Type   | Points | Team Member(s) |
|---------------------------------|--------|--------|----------------|
| Web-based Game                  | Major  | 2      | qsomarri, ebengtss |
| Remote Players                  | Major  | 2      | qsomarri, jpiech |
| Multiplayer                     | Major  | 2      | qsomarri       |

### User Management
| Module                          | Type   | Points | Team Member(s) |
|---------------------------------|--------|--------|----------------|
| User Management & Authentication| Major  | 2      | jpiech, mtrullar, qsomarri |
| Game statistics and match history | Minor | 1      | mtrullar, ebengtss|

### Accessibility
| Module                          | Type   | Points | Team Member(s) |
|---------------------------------|--------|--------|----------------|
| Multi-language Support          | Minor  | 1      | ebengtss       |

### Module of Choice
 | Module                          | Type   | Points | Team Member(s) |
 |---------------------------------|--------|--------|----------------|
 | Sandboxing                      | Major  | 2      | jpiech         |

**Why this module?**
We chose to implement a sandboxing system to securely execute untrusted player-submitted code in real time. This was critical to prevent malicious code from affecting our servers or other players' games, while allowing instant feedback—core to VersuSCode’s competitive gameplay.

**Technical Challenges Addressed:**
- **Security:** Isolated code execution to prevent system calls, infinite loops, or resource exhaustion attacks.
- **Performance:** Optimized Docker-in-Docker to launch fast, lightweight and pre-configured containers for each submission.
- **Complexity:** Managed nested Docker networks and permissions to ensure containers could communicate with the evaluation system without exposing the host.

**Value Added:**
- **Player Experience:** Enables real-time code evaluation, a cornerstone of the game’s fast-paced nature.
- **Scalability:** Automated container cleanup and resource limits allow simultaneous games without degradation.
- **Flexibility:** New coding challenges can be added by simply updating the tester script, without modifying the core system.

**Why Major Module (2 points)?**
This module required extensive research and development time to:
1. Design a secure architecture using Docker-in-Docker (rarely documented for gaming).
2. Implement automated image building and cleanup scripts to handle high player concurrency.
3. Integrate seamlessly with WebSockets for live feedback and the backend for result persistence.

**Total Points:** 8 Major (16 points) + 3 Minor (3 points) = **19 points**

---

## Individual Contributions
- **jpiech:** Containerization, SSL, authentication, rate limiting, sandbox, profile backend
- **ebengtss:** Frontend (Next.js), Nginx reverse proxy, internationalization
- **mtrullar:** Database schema, ORM, authentication backend, game statistics, submission logic
- **qsomarri:** Social system, WebSocket game logic, challenges, test scripts

---

## Instructions

### Prerequisites
- Install [Docker](https://www.docker.com/) on your machine.

### Setup and Execution
1. Clone the project repository to your local machine.
2. Place the provided `.env` file in the `/docker` directory at the root of the project.
3. Open a terminal and navigate to the project root.
4. Run the command `make` to build and start the containers.
5. Once the containers are running, open your web browser and go to [https://localhost:8443](https://localhost:8443).
6. Register for an account.
7. Create a game room and share the **Room ID** with other players who wish to join.
8. As the room creator, select a coding challenge and start the game.
9. Players must solve the challenge in fewer than 3 attempts to win!


---

## Resources
- **Documentation:**
  - [Docker](https://docs.docker.com/)
  - [Next.js](https://nextjs.org/docs)
  - [NestJS](https://docs.nestjs.com/)
  - [Prisma](https://www.prisma.io/docs)
  - [YouTube Tutorials](https://www.youtube.com/)
  - [OpenClassrooms](https://openclassrooms.com/)

- **AI Usage:**
  - Formatting of this README.md
  - Occasional explanation of technical concepts
