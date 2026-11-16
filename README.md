# Chama's Academy

Indoor Cricket & Football Stadium Management System.

A secure, enterprise-grade full-stack web application designed for booking indoor stadium slots, managing cricket and football leagues, assigning user roles (Admin, Umpire, User), verifying payments, and delivering real-time ball-by-ball match scorecards.

---

## 🏗️ Architecture Overview

The project is structured into independent frontend and backend modules:

```text
Chamas-Academy/
├── backend/                   # Java Spring Boot 4.1.1 REST API
│   ├── src/main/java/         # Controllers, Services, Repositories, Entities
│   ├── src/main/resources/    # application.yml (MySQL), application-test.yml (H2)
│   ├── src/test/java/         # JUnit 5, Mockito & MockMvc tests
│   └── pom.xml                # Maven configuration (Java 21 target on Java 26 JDK)
│
├── frontend/                  # React 18 + Vite 6 + TypeScript 5.6 SPA
│   ├── src/components/        # UI components (Header, Footer, Hero, Cards)
│   ├── src/pages/             # Route pages (Home, Booking, Scores, Auth)
│   ├── src/services/          # API client calling Spring Boot endpoints
│   ├── src/styles/            # Pure CSS design tokens & responsive layout
│   ├── package.json           # React 18, React Router v6, Vitest 2.1
│   └── vite.config.ts         # Vite bundler & backend proxy config
│
├── docs/                      # Architecture, API specs, and schemas
├── migration-backup/          # Preserved UI assets from initial design stage
├── .gitignore                 # Unified ignore rules (Maven, Java, Vite, Node)
└── README.md                  # Project documentation
```

---

## 🛠️ Technology Stack

### Backend
- **Language:** Java 26 (targeted to Java 21 LTS compatibility)
- **Framework:** Spring Boot 4.1.1
- **Security:** Spring Security + Stateless JWT (JJWT 0.12.6) + BCrypt
- **ORM & Data:** Spring Data JPA + Hibernate ORM
- **Primary Database:** MySQL 8.0 (active on port 3306)
- **Test Database:** H2 in-memory isolated database
- **Build Tool:** Apache Maven 3.9+
- **Testing:** JUnit 5, Mockito, Spring Boot Test, MockMvc
- **Architecture:** `Controller → Service → Repository → MySQL Database`

### Frontend
- **Framework:** React 18
- **Build Tool:** Vite 6
- **Language:** TypeScript 5.6
- **Routing:** React Router DOM v6
- **Styling:** Pure CSS with design tokens (Premium Stadium theme: Dark Navy `#0B1426` & Metallic Gold `#D4AF37`)
- **Icons:** Lucide React
- **Testing:** Vitest 2.1, React Testing Library, `@testing-library/jest-dom`, jsdom
- **Architecture:** `React Components → API Services → Spring Boot REST API`

---

## 📋 Core System Capabilities

1. **User Authentication & Authorization**: Stateless JWT authentication with roles: `ADMIN`, `UMPIRE`, and `USER`.
2. **Stadium Slot Booking**: Hourly bookings for Indoor Cricket and Football with a 1-hour minimum duration.
3. **Availability Management**: Real-time slot status, conflict prevention, and holiday schedules.
4. **Payment Verification**: Bank transfer receipt uploads with manual Admin approval workflow.
5. **Cricket Live Scoring**: Ball-by-ball digital scorecards for Limited-Overs and Test formats.
6. **Football Live Scoring**: Match timers, goal tracking, and half-time/full-time event logs.
7. **Tournament & League Management**: Fixture creation, league tables, semi-finals, and finals.
8. **Role-Based Dashboards**: Dedicated administrative and umpire management portals.

---

## 🚀 Development Roadmap

- [x] **Milestone 1:** Initial Next.js exploration & Git connection
- [x] **Milestone 2:** Architecture Migration Preparation & Safe Cleanup
- [ ] **Milestone 3:** Spring Boot Backend Initialization (Maven, Security, JWT, JPA)
- [ ] **Milestone 4:** React + Vite Frontend Initialization (React Router, Pure CSS)
- [ ] **Milestone 5:** Database Schema & Entity Mapping (MySQL 8.0)
- [ ] **Milestone 6:** Authentication & Role-Based Authorization
- [ ] **Milestone 7:** Stadium Slot Booking & Receipt Approval
- [ ] **Milestone 8:** Live Cricket & Football Scoring Engine
- [ ] **Milestone 9:** Tournament Management System
- [ ] **Milestone 10:** Admin & Umpire Dashboards
