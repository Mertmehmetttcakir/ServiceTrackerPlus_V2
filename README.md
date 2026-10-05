# ServiceTracker Plus 🏎️💼

A modern, comprehensive CRM and Management System designed specifically for Auto Repair Shops and Garages. This application streamlines customer relations, vehicle service history, appointment scheduling, supplier debts, and comprehensive financial tracking in a single, intuitive interface.

## 🌟 Key Features

- **Multi-Tenant Architecture**: Built with complete data isolation so each user/shop only sees their own data.
- **Customer & Vehicle Management**: Track customer details, their vehicles, and complete service histories.
- **Dynamic Appointments & Job Tracking**: Schedule appointments, assign technicians, and track job statuses (Pending, Completed, Paid).
- **Advanced Financial Dashboard**: Real-time insights into revenue, expenses, supplier debts, and net profit margins.
- **Visual Analytics**: Interactive charts (Recharts) for revenue trends, top VIP customers, and most requested services.
- **PDF Export & Archiving**: Generate professional PDF invoices and service reports, and upload physical document photos for archiving.
- **Supplier & Expense Management**: Track outgoing cash flows, supplier invoices, and outstanding debts.
- **Secure Authentication**: Robust login/registration flow powered by Supabase Auth.

## 🛠️ Tech Stack & Architecture

This project adopts a modern React ecosystem, completely removing legacy state managers (like Redux) in favor of server-state management.

- **Frontend Framework**: React 18 (Vite) + TypeScript
- **UI & Styling**: Chakra UI (for accessible, responsive, and themeable components)
- **State & Data Fetching**: React Query (TanStack Query v5) + React Context API
- **Backend & Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Security**: Strict PostgreSQL Row Level Security (RLS) policies ensuring cross-tenant data safety.
- **Data Visualization**: Recharts
- **PDF Generation**: jsPDF + jspdf-autotable
- **Form Handling & Validation**: React Hook Form + Zod

## 🏗️ Project Structure

```
src/
├── components/     
│   ├── common/         # Reusable UI components (Modals, Buttons)
│   ├── features/       # Feature-specific complex components (Charts, Forms)
│   └── layouts/        # Page layouts (Sidebar, Header, MainLayout)
├── context/            # React Contexts (AuthContext)
├── hooks/              # Custom React Query hooks (useCustomers, useJobs, useReports)
├── pages/              # Route views (Dashboard, Finance, Reports, Suppliers, etc.)
├── services/           # Supabase API abstraction layer (BaseApiService)
├── types/              # TypeScript interfaces (Database schema mappings)
└── utils/              # Helper functions (date formatting, formatters)
```

## 🔒 Security & Data Integrity

- **Row Level Security (RLS)**: Every single table (Customers, Jobs, Vehicles, Financial Transactions, Supplier Invoices) is protected by RLS. Users can only `SELECT`, `INSERT`, `UPDATE`, or `DELETE` records where `user_id` matches their authenticated session `auth.uid()`.
- **Storage Buckets**: Document uploads (supplier invoices, vehicle photos) are stored in secure Supabase Storage buckets with strict MIME-type and size limitations enforced by bucket policies.

## 🚀 Getting Started

### Prerequisites
- Node.js (>= 18.0.0)
- Supabase Project (Database & Auth setup required)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Mertmehmetttcakir/ServiceTrackerPlus_V2.git
cd servicetracker-plus
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory and add your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server:
```bash
npm run dev
```

## 📈 Future Roadmap
- Vehicle Intake Check-up Form (Visual damage marking)
- Quotation / Proforma Invoice Generation
- Realtime Calendar Sync via Supabase Realtime subscriptions
- Automated Email / SMS Notifications for Job Statuses

---
*This project is continuously evolving and serves as a demonstration of building scalable, secure, and highly interactive SaaS applications using React and Supabase.*
