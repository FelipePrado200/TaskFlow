# TaskFlow - Task Management Platform

A comprehensive department-based task management system with authentication, built for modern teams.

## 🚀 Features

- ✅ Complete login and registration system
- ✅ Department-based task creation
- ✅ Task comments and collaboration
- ✅ Delete tickets/tasks functionality
- ✅ User sector selection
- ✅ Task status updates
- ✅ Priority system (low, medium, high)
- ✅ Kanban board view
- ✅ Analytics dashboard
- ✅ Dark/Light theme toggle
- ✅ Fully responsive design (mobile-first)
- ✅ AI-powered task suggestions

## 🛠 Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Prisma** (SQLite)
- **NextAuth.js**
- **bcryptjs**
- **Lucide React** (Icons)

## 📱 Mobile Experience

TaskFlow is designed with a mobile-first approach, ensuring a seamless experience across all devices:

- Responsive navigation with collapsible menu
- Touch-friendly interface with optimized tap targets
- Adaptive layouts that scale from mobile to desktop
- Compact header design for better screen real estate on mobile
- Swipe-friendly interactions on Kanban board
- Optimized performance for mobile networks

## 📦 Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env.local
```

Edit the `.env.local` file:
```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
```

3. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

4. Run the development server:
```bash
npm run dev
```

5. Open http://localhost:3000

## 📖 Usage

1. Create an account at `/register`
2. Login at `/login`
3. Access the dashboard at `/dashboard`
4. Create tasks, add comments, and manage status
5. View tasks in Kanban board at `/kanban`
6. Check analytics at `/metrics`

## 🏢 Available Departments

- IT (TI)
- HR (RH)
- Finance (Financeiro)
- Marketing
- Operations (Operações)
- Sales (Vendas)

## 🎨 Features Overview

### Dashboard
- View all tasks in your department
- Filter by status and priority
- Quick task creation

### Kanban Board
- Drag and drop tasks between columns
- Visual workflow management
- Real-time status updates

### Analytics
- Task completion metrics
- Department performance
- Priority distribution

### AI Task Creator
- Intelligent task suggestions
- Natural language processing
- Automated task generation

## 📄 License

This project is licensed under the MIT License.
