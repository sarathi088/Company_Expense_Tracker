# 🚛 Company Expense & Load Tracker

An enterprise-grade, iOS-inspired Glassmorphism web application built with **React**, **Vite**, **Tailwind CSS**, and **Supabase**. Designed to track daily company loads, rates, expenses, locations, and generate real-time analytics, exports (Excel/PDF), and role-based operations.

🌐 **Live Production App:** [https://company-expense-tracker-bxkq-eta.vercel.app](https://company-expense-tracker-bxkq-eta.vercel.app)

---

## 👥 Project Collaborators & Co-Workers

* **Primary Developer & GitHub Account:** [@sarathi088](https://github.com/sarathi088)
* **GitHub Repository:** [https://github.com/sarathi088/Company_Expense_Tracker](https://github.com/sarathi088/Company_Expense_Tracker)

---

## 🔑 Environment Variables Configuration

This application uses **Supabase** as its cloud database provider. The frontend connects directly to Supabase using standard Vite environment variables.

### Required Environment Variables

| Variable Name | Description | Example / Format |
|---|---|---|
| `VITE_SUPABASE_URL` | Your Supabase Project API URL | `https://eigqtczztqrsiftykuhs.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase Public Anonymous API Key | `sb_publishable_...` |

---

## 🗄️ Database Setup (Supabase)

1. Sign in to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Open the **SQL Editor** tab in the left sidebar.
3. Open the `supabase_schema.sql` file in this repository, copy all SQL statements, paste them into the Supabase SQL editor, and click **Run**.

---

## 🚀 Deployment Instructions

### 1. Push to GitHub (`sarathi088`)

```bash
git remote set-url origin https://github.com/sarathi088/Company_Expense_Tracker.git
git branch -M main
git push -u origin main
```

### 2. Vercel Hosting Setup

1. **Import to Vercel:** Go to [Vercel Dashboard](https://vercel.com/new) and import `Company_Expense_Tracker`.
2. **Framework:** `Vite`
3. **Environment Variables:** Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
4. **Deploy:** Click **Deploy**.

---

## 🛠️ Local Development Commands

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Build production bundle
npm run build
```

---

© 2026 **Kumar Impex Loads**. Maintained under [@sarathi088](https://github.com/sarathi088).

