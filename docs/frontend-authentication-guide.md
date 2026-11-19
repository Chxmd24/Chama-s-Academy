# Chama's Academy - Frontend Authentication Integration Guide

## 1. Overview & Architecture

This document specifies the React 18 + TypeScript + Vite frontend authentication architecture for Chama's Academy (Indoor Cricket & Football Stadium Management System) and its integration with the Spring Boot 4.1.1 REST security layer.

### 1.1 Technology Stack & Versions
- **React:** 18.3.1
- **TypeScript:** 5.6.3
- **Vite:** 6.4.6
- **React Router DOM:** 6.28.2
- **Lucide React:** 0.468.0
- **Testing:** Vitest 2.1.8 + React Testing Library 16.0.1 + Jest-DOM 6.6.3
- **Backend API:** Spring Boot 4.1.1 + Spring Security 7.1.1 + JJWT 0.12.6

### 1.2 Component Hierarchy & Data Flow

```
                      [ App.tsx ]
                           |
                     [ AppRoutes ]
                           |
                   [ AuthProvider ]  <--- Holds in-memory access token & user profile
                           |
                   [ AppLayout ]
                   /           \
              [ Header ]     [ Main Content Area ]
              (Auth chip,     /        |          \
               Logout,       /         |           \
               Sign In) [ Public ] [ Protected ] [ Protected ]
                        (HomePage, (Dashboard,   (AdminDashboard,
                         Login,     requires      requires
                         Register)  auth)         ROLE_ADMIN)
```

---

## 2. Centralized Typed API Client

Located in [`frontend/src/services/api.ts`](file:///e:/CEng/Chamas-Academy/frontend/src/services/api.ts).

### 2.1 Environment Configuration
- The backend API URL is resolved dynamically via Vite environment variables:
  ```typescript
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";
  ```
- **Local Development:** When `VITE_API_BASE_URL` is omitted, requests route through Vite's built-in dev-server proxy targeting `http://localhost:8080/api`.
- **Production / Staging:** Set `VITE_API_BASE_URL=https://api.yourdomain.com/api`.

### 2.2 Endpoints Supported
1. `POST /api/auth/register`:
   - Consumes `RegistrationRequest` (`firstName`, `lastName`, `email`, `password`, `phoneNumber`).
   - Produces `RegistrationResponse` (`id`, `firstName`, `lastName`, `email`, `roles`, `status`, `createdAt`).
2. `POST /api/auth/login`:
   - Consumes `LoginRequest` (`email`, `password`).
   - Produces `LoginResponse` (`tokenType`, `accessToken`, `expiresIn`, `user`, `roles`).
3. `GET /api/auth/me`:
   - Transmits HTTP header `Authorization: Bearer <token>`.
   - Produces `UserProfileResponse`.
4. `GET /api/health`:
   - Verifies backend operational connectivity.

### 2.3 Safe Error Mapping (`ApiError`)
The client translates HTTP errors into typed `ApiError` instances:
- Automatically extracts field-level validation errors from Spring Boot validation payloads (`fieldErrors`).
- Converts HTTP 409 into duplicate email conflict notices.
- Prevents database column names, internal server traces, or sensitive stack information from reaching the user interface.
- Never logs tokens or passwords to the browser console.

---

## 3. Token Storage Architectural Decision

### 3.1 Strict In-Memory Storage (Current Phase)
In adherence to modern web application security practices and Prompt 19 specifications:
* **Storage Location:** Access tokens are stored **strictly in React state (`useState`)** within `AuthProvider`.
* **Zero Browser Persistence:** Access tokens are **NOT stored in `localStorage` or `sessionStorage`**.
* **Security Rationale:**
  - `localStorage` and `sessionStorage` are completely accessible to any JavaScript executing in the origin context. Storing JWTs in Web Storage creates severe vulnerability to Cross-Site Scripting (XSS) token exfiltration.
  - In-memory storage completely isolates tokens from local browser disk persistence.
* **Operational Implication:**
  - Performing a full hard page refresh (`F5` or `Ctrl+R`) will clear in-memory React state, requiring the user to re-authenticate.
  - Seamless persistent sessions across page reloads will be introduced in a future milestone via secure **HttpOnly, SameSite=Strict refresh cookies**.

---

## 4. User Registration & Login Flows

### 4.1 Registration Flow
1. User navigates to `/register` and fills in First Name, Last Name, Email, Password, Confirm Password, and optional Phone.
2. **Client-side validation:**
   - Validates name length (1-100 chars).
   - Validates email format (RFC pattern, max 255 chars).
   - Enforces password policy: minimum 8 characters, uppercase, lowercase, digit, and special character.
   - Enforces confirm-password match.
   - Validates optional phone number format (7-30 chars).
3. **Privilege Escalation Prevention:**
   - The registration form contains zero role selection inputs.
   - The request payload hardcodes only customer demographic attributes.
4. **Submission:**
   - Form button disables and displays "Creating account..." to prevent duplicate double-clicks.
   - On HTTP 409 Conflict: Displays banner `"An account with this email address already exists. Please sign in or use a different email."`
   - On HTTP 201 Created: Renders a success confirmation view displaying the registered email address and a direct link to `/login`.

### 4.2 Login Flow
1. User enters email and password at `/login`.
2. Client validates inputs are non-empty.
3. Submits `POST /api/auth/login`.
4. **Response Handling:**
   - **HTTP 200 OK:** Stores JWT in memory, updates `AuthContext` state, and navigates to the destination route (from `location.state.from`) or default `/dashboard`.
   - **HTTP 401 Unauthorized:** Displays generic `"Invalid email or password."` without account enumeration leaks.
   - **HTTP 403 Forbidden:** Displays `"Account is inactive or suspended. Please contact stadium administration."`
5. Passwords and tokens are never written to persistent client storage or logged.

---

## 5. Protected Routes & Role-Based Access Control (RBAC)

### 5.1 Route Wrapper (`ProtectedRoute`)
Located in [`frontend/src/components/common/ProtectedRoute.tsx`](file:///e:/CEng/Chamas-Academy/frontend/src/components/common/ProtectedRoute.tsx):
- **Unauthenticated Check:** If user is not authenticated, redirects to `/login` with `state: { from: location }` so the user can be returned to their intended destination upon successful login.
- **Role Authorization:** Checks whether `user.roles` contains any of `allowedRoles` (supporting both `"ADMIN"` and `"ROLE_ADMIN"` syntax).
- **Access Denied:** If authenticated but lacking the required role, redirects to `/unauthorized` (`UnauthorizedPage.tsx`), rendering a branded HTTP 403 access-denied screen.

### 5.2 Application Route Mapping
| Path | Component | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `/` | `HomePage` | Public | Stadium landing page & backend health indicator |
| `/login` | `LoginPage` | Public (Guests) | Customer & staff sign in |
| `/register` | `RegisterPage` | Public (Guests) | Customer registration |
| `/unauthorized` | `UnauthorizedPage` | Public / Authenticated | Branded 403 Access Denied notification |
| `/dashboard` | `DashboardPage` | Authenticated | Player dashboard, profile details, bookings placeholder |
| `/admin` | `AdminDashboardPage` | `ROLE_ADMIN` | Stadium administration center & RBAC testing |
| `*` | `NotFoundPage` | Public | Branded 404 handler |

---

## 6. Authenticated Navigation (`Header`)

Located in [`frontend/src/components/layout/Header.tsx`](file:///e:/CEng/Chamas-Academy/frontend/src/components/layout/Header.tsx):
- **Guest State:**
  - Displays "Sign In" (`/login`) and "Register" (`/register`) action buttons.
- **Authenticated State:**
  - Displays user profile badge chip (`{user.firstName}`) linked to `/dashboard`.
  - Displays "Dashboard" link in top navigation.
  - If user holds `ROLE_ADMIN`, dynamically renders "Admin" link in top navigation.
  - Displays "Sign Out" button which invokes `logout()` and redirects to `/`.

---

## 7. Local Development & Testing Instructions

### 7.1 Running the Frontend
```bash
# In the frontend directory (or using npm --prefix frontend)
npm --prefix frontend run dev
```
Accessible at: `http://localhost:5173`. Proxies `/api` calls directly to `http://localhost:8080`.

### 7.2 Running Tests
```bash
# Run Vitest test suite once
npm --prefix frontend test -- --run

# Run TypeScript type checking
npm --prefix frontend run type-check

# Run production build
npm --prefix frontend run build
```

---

## 8. Known Limitations & Next Steps

1. **In-Memory Token Lifecycle:** Because tokens reside in React memory, page refreshes clear session state. Future milestones will introduce a secure refresh-token mechanism (`/api/auth/refresh`) using HttpOnly cookies.
2. **Booking & Tournaments:** Dashboard contains placeholder sections for slot reservations and tournament brackets; business logic will be integrated in subsequent milestones.
3. **Backend Live Users:** The development MySQL database currently contains zero live accounts. Testing was performed using isolated in-memory mocks. Creating administrator and customer accounts will be authorized in a future setup step.
