# Frontend — Yoga Studio App

Angular single-page application for managing yoga sessions, with comprehensive unit and E2E test coverage.

← [Back to main README](../README.md)

---

## Tech Stack

- **Angular** — SPA framework
- **TypeScript**
- **Angular Material** — UI components
- **Jest** — Unit testing
- **Cypress** — End-to-end testing
- **NYC (Istanbul)** — E2E coverage reporting

---

## Prerequisites

- Node.js & npm

---

## Setup & Installation

```bash
cd front
npm install
```

### Run the development server

```bash
ng serve
```

App available at `http://localhost:4200`.

> The backend must be running at `http://localhost:8080` for API calls to work.

---
## Running Tests

### Unit Tests (Jest)

```bash
npm run test
```

With coverage:

```bash
npm run test:coverage
```

Coverage report available at:
```
coverage/lcov-report/index.html
```

**Coverage target: ≥ 80%**

### End-to-End Tests (Cypress)

```bash
npm run e2e
```

With coverage:

```bash
npm run e2e:coverage
```

E2E coverage report available at:
```
coverage/lcov-report/index.html
```

**Coverage target: ≥ 80%**