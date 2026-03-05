# Yoga Studio App

A full-stack yoga session management application. The focus of this project is implementing comprehensive test coverage across the entire stack: unit tests, integration tests, and end-to-end tests.

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Backend** | Java 11, Spring Boot 2.6.1, Spring Security (JWT), Spring Data JPA, MySQL |
| **Frontend** | Angular, TypeScript |
| **Testing** | JUnit 5, Mockito, JaCoCo, Jest, Cypress, NYC/Istanbul |

---

## Project Structure

```
yoga-app/
├── back/       # Spring Boot REST API
├── front/      # Angular SPA
└── README.md
```

---

## Documentation

- [Backend — Setup, API & Tests](./back/README.md)
- [Frontend — Setup, Architecture & Tests](./front/README.md)

---

## Prerequisites

- Java 11
- Node.js & npm
- MySQL 8.0+
- Maven

---

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/fquenum/P5_yoga_app_test.git
cd yoga-app
```

### 2. Start the backend

See full instructions → [back/README.md](./back/README.md)

```bash
cd back
mvn spring-boot:run
```

API available at `http://localhost:8080`

### 3. Start the frontend

See full instructions → [front/README.md](./front/README.md)

```bash
cd front
npm install
ng serve
```

App available at `http://localhost:4200`

---

## Testing Overview

| Scope | Framework | Coverage Target |
|-------|-----------|----------------|
| Backend unit & integration | JUnit 5 + Mockito + H2 | ≥ 80% (JaCoCo) |
| Frontend unit | Jest | ≥ 80% |
| Frontend E2E | Cypress + NYC | ≥ 80% |

Full details in each sub-README:
- [Backend testing](./back/README.md#running-tests)
- [Frontend testing](./front/README.md#running-tests)