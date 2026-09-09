# TaskFlow — Frontend Client

A modern, collaborative Kanban workspace client built with **React**, **TypeScript**, **Redux Toolkit**, and **Tailwind CSS**. Designed for high responsiveness, TaskFlow features optimistic drag-and-drop state synchronization, silent JWT session persistence, multi-parameter filtering, and defensive UX workflows.

---

## 🚀 Key Features

- **Interactive Kanban Board:** Fluid column-to-column task reordering powered by `@hello-pangea/dnd` with optimistic UI updates and background database position reconciliation.
- **Resilient Authentication Flow:** In-memory JWT access token management paired with silent refresh handling and secure cookie-based session persistence.
- **Workspace Management (CRUD):** Centralized dashboard to view, create, edit, and delete workspaces with dynamic board routing and owner indicators.
- **Granular Role-Based Access (RBAC):** Permission-scoped actions distinguishing Owner, Admin, and Member rights (workspace teardown, invitations, and allocations).
- **Deep Task Modeling:** Interactive task detail modal supporting in-place editing for titles, descriptions, priority tiers (`Low`, `Medium`, `High`, `Urgent`), assignees, and deadlines.
- **Discussion Threads & Comments (CRUD):** Real-time task discussion stream with inline comment editing and deletion controls.
- **Non-Destructive Audit Trail:** Automated activity history logger tracking member allocations, priority changes, and status shifts over time.
- **Multi-Parameter Search & Discovery:** Debounced live text search combined with status, priority, and assignee filters.
- **Defensive UX Architecture:** Reusable, accessible `ConfirmModal` dialogs safeguarding critical operations (workspace deletion, task removal, session termination).

---

## 🛠️ Tech Stack

- **Framework:** React 18
- **Build Tool:** Vite
- **Language:** TypeScript
- **State Management:** Redux Toolkit (`createSlice`, `createAsyncThunk`)
- **Routing:** React Router DOM v6
- **Styling:** Tailwind CSS
- **Drag-and-Drop:** `@hello-pangea/dnd`
- **Icons:** Lucide React
- **Notifications:** React Hot Toast
- **HTTP Client:** Axios (Interceptors for silent refresh and token handling)

---

## 📂 Project Structure

```text
src/
├── api/                  # Axios instance, baseURL config & token interceptors
├── assets/               # Static icons, illustrations, and logos
├── components/
│   ├── auth/             # Login & Signup form views
│   ├── board/            # KanbanColumn, TaskCard, DND drop wrappers
│   ├── common/           # Navbar, ConfirmModal, ProtectedRoute
│   └── modals/           # CreateTaskModal, TaskDetailModal, InviteMemberModal, EditProjectModal
├── hooks/                # Custom utility hooks
├── store/
│   ├── index.ts          # Typed RootState, AppDispatch, and store initialization
│   └── slices/
│       ├── authSlice.ts      # Session lifecycle, login, logout, refresh
│       ├── projectSlice.ts   # Workspaces, board columns, members
│       └── taskSlice.ts      # Task CRUD, filters, drag-and-drop, comments, logs
├── types/                # Strict TypeScript interfaces, enums, and API models
├── App.tsx               # Route architecture and modal mount points
└── main.tsx              # Application entry point with Redux Provider

```

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1

```

For production deployments (e.g., Netlify), update this value to point to your live backend endpoint:

```env
VITE_API_BASE_URL=https://your-api-domain.com/api/v1

```

---

## 🏁 Getting Started Locally

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm** / **yarn** / **pnpm**

### Installation

1. **Clone the repository:**

```bash
git clone https://github.com/BatraAayush/taskflow-frontend.git
cd taskflow-frontend

```

2. **Install dependencies:**

```bash
npm install

```

3. **Start the development server:**

```bash
npm run dev

```

4. Open `http://localhost:5173` in your browser.

---

## 🏗️ Build & Deployment

Compile the TypeScript source and build production-optimized static assets:

```bash
npm run build

```

Preview the production build locally:

```bash
npm run preview

```

### Deploying to Netlify

Ensure your root directory or build settings include a `_redirects` file in the `public/` folder to support client-side routing:

```text
/*    /index.html   200

```

---

## 🔒 Security & Architecture Notes

- **JWT in Memory:** Access tokens are stored exclusively in application state (Redux) and are never written to `localStorage` or `sessionStorage` to mitigate XSS exposure.
- **Silent Token Rotation:** Axios response interceptors catch `401 Unauthorized` responses and initiate token refreshes using HttpOnly refresh cookies without disturbing active user workflows.
- **Optimistic Updates:** Drag-and-drop actions update the Redux store instantly for zero-latency interactions, while issuing a background PATCH request. State automatically rolls back if the server connection drops.
