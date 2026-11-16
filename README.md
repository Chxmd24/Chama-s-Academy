# Chama's Academy

Indoor Cricket & Football Stadium Management System.

A modern, full-stack web application designed for booking indoor cricket and football stadium slots, managing tournaments, assigning user roles (Admin, Umpire, User), verifying payments, and delivering real-time ball-by-ball cricket and football live scores.

---

## 🛠️ Technology Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Backend & Database:** [Supabase](https://supabase.com/) (Database, Auth, Storage, Realtime - *planned*)
- **Deployment:** [Vercel](https://vercel.com/)
- **Version Control:** Git & GitHub

---

## 📁 Project Structure

```text
Chamas-Academy/
├── public/                 # Static assets (images, icons, logos)
├── src/
│   ├── app/                # Next.js App Router pages and layouts
│   │   ├── favicon.ico     # Site favicon
│   │   ├── globals.css     # Global styles and Tailwind configuration
│   │   ├── layout.tsx      # Root HTML layout with font configuration
│   │   └── page.tsx        # Homepage ("Chama's Academy - Indoor Cricket & Football Stadium")
│   ├── components/         # Reusable React components
│   │   ├── common/         # Layout components (Header, Footer, Navigation)
│   │   └── ui/             # Generic primitive UI elements (Buttons, Cards, Inputs, Modals)
│   ├── hooks/              # Custom reusable React hooks
│   ├── lib/                # Utility functions and future client configurations
│   │   ├── supabase/       # Supabase client setup (future stage)
│   │   └── utils.ts        # Helper functions (e.g., class merger cn)
│   └── types/              # TypeScript definitions and interfaces
│       └── index.ts        # Core business domain types
├── .env.example            # Template for environment variables
├── .gitignore              # Git ignore rules for node_modules, build outputs, and env files
├── eslint.config.mjs       # ESLint 9 configuration
├── next.config.ts          # Next.js configuration
├── package.json            # Project dependencies and script definitions
├── tsconfig.json           # TypeScript configuration
└── README.md               # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:

- **Node.js**: `v20.x` or higher (tested on `v24.12.0`)
- **npm**: `v10.x` or higher (tested on `11.6.2`)

### 1. Installation

Clone or open the repository folder, then install dependencies:

```bash
npm install
```

### 2. Environment Configuration

Copy the example environment file to create your local environment file:

```bash
cp .env.example .env.local
```

*(Environment variables will be configured in subsequent stages when connecting Supabase).*

### 3. Run Development Server

Start the local development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## 📜 Available Scripts

| Script | Command | Description |
| :--- | :--- | :--- |
| **Development** | `npm run dev` | Starts the Next.js development server on `http://localhost:3000` |
| **Build** | `npm run build` | Compiles and builds the application for production |
| **Start** | `npm run start` | Runs the compiled production build |
| **Lint** | `npm run lint` | Runs ESLint to verify code quality and style |
| **Type Check** | `npm run type-check` | Runs the TypeScript compiler to check for type errors |

---

## 📌 Project Roadmap

- [x] **Prompt 01:** Project Initialization (Next.js, TypeScript, Tailwind CSS, ESLint, Project Structure)
- [ ] **Prompt 02:** Supabase Setup & Database Schema
- [ ] **Prompt 03:** Authentication & Role-Based Access Control (Admin, Umpire, User)
- [ ] **Prompt 04:** Stadium Slot Booking & Availability Calendar
- [ ] **Prompt 05:** Payment Receipt Upload & Admin Verification
- [ ] **Prompt 06:** Live Cricket Scoring Engine (Limited-Overs & Test formats)
- [ ] **Prompt 07:** Live Football Scoring Engine
- [ ] **Prompt 08:** Leagues, Tournaments & Fixtures
- [ ] **Prompt 09:** Admin & Umpire Dashboards
- [ ] **Prompt 10:** Production Deployment on Vercel
