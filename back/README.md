# Backend — Yoga Studio API

Spring Boot REST API with JWT authentication, serving the Yoga Studio application.

← [Back to main README](../README.md)

---

## Tech Stack

- **Java 11** — Spring Boot 2.6.1
- **Spring Security** — JWT authentication (stateless)
- **Spring Data JPA / Hibernate** — ORM
- **MySQL 8.0+** — Production database
- **H2** — In-memory database for tests (MySQL compatibility mode)
- **JUnit 5 / Mockito** — Unit & integration testing
- **JaCoCo** — Code coverage reporting
- **Maven**

---

## Prerequisites

- Java 11
- Maven
- MySQL 8.0+

---

## Setup & Installation

### 1. Database

Create the MySQL database:

```sql
CREATE DATABASE yoga_app;
```

Then run the schema script if provided, or let Hibernate auto-generate the tables (`ddl-auto=update`).

### 2. Configuration

Edit `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/yoga_app
spring.datasource.username=<your_username>
spring.datasource.password=<your_password>
spring.jpa.hibernate.ddl-auto=update

oc.app.jwtSecret=<your_jwt_secret>
oc.app.jwtExpirationMs=86400000
```

### 3. Run

```bash
mvn spring-boot:run
```

API available at `http://localhost:8080`.

---

## Running Tests

```bash
mvn test
```

### Coverage Report (JaCoCo)

After running tests, open the report at:

```
target/site/jacoco/index.html
```

**Coverage target: ≥ 80%** (DTOs excluded).