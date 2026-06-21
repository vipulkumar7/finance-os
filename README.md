# 📊 FinanceOS

FinanceOS is an ultra-premium personal financial management system and dashboard. It unifies transaction logging, investment tracking, net worth snapshots, and smart financial goals with visual analytics and interactive workflows in a sleek, glassmorphic dark theme.

---

## ✨ Features

- 💸 **Expense Tracker**: Add, edit, filter, and search transaction records with custom category grouping and payment mode statistics.
- 📈 **Analytics Engine**: Interactive chart layouts showcasing monthly expense trends, investment patterns, category distributions, and savings rates using Recharts.
- 📅 **Calendar Timeline**: A dedicated grid overview showing daily aggregate cash outflows.
- 💼 **Investment Portfolio**: Track monthly allocations across stocks, mutual funds, gold, fixed deposits, EPF, and NPS.
- 🏛️ **Net Worth Snapshots**: Monitor assets vs. liabilities MoM.
- 🎯 **Financial Goals**: Set and visualize progress bars for long-term target milestones.
- ⚡ **PWA & Android Support**: Ready for mobile installations with custom app shortcuts, focus-existing launch handlers, and sidebar integrations.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS & Vanilla CSS (Harmonious Dark Theme)
- **Database ORM**: Prisma (PostgreSQL / SQLite)
- **Authentication**: NextAuth.js
- **Animations**: Framer Motion
- **Data Visualization**: Recharts
- **Parsing**: SheetJS (XLSX) for importing legacy sheet data

---

## 📱 Mobile App (Android APK)

We support standalone PWA installation directly from the browser, or you can side-load the native Android application package:

### Direct APK Installation
1. Download [FinanceOS.apk](./FinanceOS.apk) from the root of this repository.
2. Transfer it to your Android device.
3. Open the file on your device and click **Install** (you may need to enable "Allow installation from unknown sources" in your browser/file explorer settings).

---

## 🚀 Local Development

### 1. Installation
Clone the repository and install dependencies:
```bash
npm install
```

### 2. Database Configuration
Create a `.env` file in the root directory and add your connection string:
```env
DATABASE_URL="your-postgresql-database-url"
NEXTAUTH_SECRET="your-nextauth-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

Sync the database schema:
```bash
npx prisma db push
```

### 3. Excel Data Import
To populate the database using your legacy Google Sheets/Excel template:
1. Save your sheet in the root folder as `expense.xlsx`.
2. Run the importing utility:
```bash
node scratch/import-excel.js
```

### 4. Running the Dev Server
Launch the turbopack development environment:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.
