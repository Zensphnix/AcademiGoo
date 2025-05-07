# 🚍 AcademiGo - Student Transportation Management App

AcademiGo is a modern, web-based application designed to streamline and enhance the transportation experience for students, drivers, and administrators within an educational institution. It provides real-time bus tracking, digital bus passes, complaint management, and administrative tools for efficient fleet and user management.

## ✨ Features

### 🧑‍🎓 For Students:
- 🧭 **Dashboard:** Personalized view with live bus location, route information, and quick access to common actions.
- 🎫 **Digital Bus Pass:** View and manage digital bus passes with QR codes.
- ♻️ **Renew Pass:** Renew existing bus passes.
- ⏱️ **ETA Checking:** Get real-time estimated arrival times for their bus.
- 📸 **Complaint Submission:** Easily submit complaints regarding bus services, with optional photo uploads.
- 🔄 **Complaint Status:** Track the status of submitted complaints.
- 🔔 **Notifications:** Receive alerts for bus delays, pass renewals, etc.
- 🙍‍♂️ **Profile Management:** Update personal information.
- 🛣️ **Register/Update Bus Route:** Students can register or update their primary bus route.
- 🔍 **Search:** Search for bus routes and buses (by number, driver, status).
- 🌙🗣️ **Dark Mode & Language Preference:** Personalize the app experience.

### 🧑‍✈️ For Drivers:
- 📋 **Duty Dashboard:** View assigned routes, stops, and manage trip status.
- ✅ **Mark Stop Arrival:** Update stop arrival status during a trip.
- 📱 **Attendance QR Code:** Generate QR codes for student attendance scanning.
- 🕰️ **Notify Delay:** Inform students on the route about delays with a reason.
- 🆘🗺️ **SOS & Navigation:** Access emergency alert features and route navigation via Google Maps.
- 🌙🗣️ **Dark Mode & Language Preference:** Personalize the app experience.

### 🧑‍💼 For Admins:
- 📊 **Dashboard:** Overview of active buses, total users, and quick access to management tasks.
- 🔎 **Global Search:** Search across buses, routes, and users.
- 🧑‍💻 **User Management:** View, add, edit, and (de)activate user accounts (Students, Teachers, Drivers). Assign buses to drivers.
- 🚍 **Bus Fleet Management:** Add, edit, and remove buses from the fleet. View bus status and details.
- 🗺️ **Route Management:** Create, edit, and delete bus routes and their stops.
- 🛠️ **Complaint Resolution:** View, manage, and resolve student-submitted complaints.
- 🧭 **Live Map:** Track real-time locations of all active buses.
- ⚙️ **Application Settings:** Configure general app settings, notification preferences, and security features like device binding.
- 🌙🗣️ **Dark Mode & Language Preference:** Personalize the app experience.

## 🛠️ Tech Stack

- 🧩 **Frontend:** Next.js (App Router), React, TypeScript
- 🎨 **Styling:** Tailwind CSS, ShadCN UI
- 📦 **State Management:** React Hooks (useState, useEffect, useContext)
- 📝 **Forms:** React Hook Form, Zod (for validation)
- 🗺️ **Mapping:** Google Maps API (via `@vis.gl/react-google-maps`)
- 📷 **QR Code Generation:** `api.qrserver.com` (client-side generation for attendance)
- 🔔 **Notifications:** `react-hot-toast` (via `useToast` hook)
- 📅 **Date Management:** `date-fns`
- 🤖 **AI (Optional/Planned):** Genkit (Google AI) - `ai-instance.ts` suggests potential integration.
- 💾 **Local Storage:** Used for persisting some user preferences and mock data for offline-first feel during development.

## 🚀 Getting Started

### ✅ Prerequisites

- 🟢 Node.js (v18.x or later recommended)
- 📦 npm or yarn
- 🔁 Git

### 📥 Installation

1. **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd academigo-app
    ```

2. **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3. **Set up Environment Variables:**
    Create a `.env` file in the root of your project and add the following variables:
    ```env
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY_HERE
    GOOGLE_GENAI_API_KEY=YOUR_GOOGLE_GENAI_API_KEY_HERE # Optional, if using Genkit features
    ```
    - 🔑 Replace with your actual API keys as needed.

### 🧪 Running the Development Server

```bash
npm run dev
# or
yarn dev
````

🌐 The application will typically be available at `http://localhost:9002`.

### 🏗️ Building for Production

```bash
npm run build
npm run start
# or
yarn build
yarn start
```

## 📁 Folder Structure (Simplified)

```
.
├── src/
│   ├── app/                # Pages & Layouts (App Router)
│   │   ├── (auth)/         # Authentication routes
│   │   ├── admin/          # Admin pages
│   │   ├── driver/         # Driver pages
│   │   ├── student/        # Student pages
│   │   ├── globals.css     # Global styles
│   │   └── layout.tsx      # Root layout
│   │   └── page.tsx        # Root page (redirect)
│   ├── components/         # UI components
│   │   ├── admin/
│   │   ├── common/
│   │   ├── driver/
│   │   ├── student/
│   │   └── ui/
│   ├── hooks/              # Custom hooks
│   ├── lib/                # Utility functions
│   ├── services/           # API services
│   └── ai/                 # AI integration files
├── public/                 # Static files
├── .env                    # Environment variables
├── next.config.ts          # Next.js config
├── package.json            # Dependencies
└── tsconfig.json           # TS config
```

## 🌐 Environment Variables

* 🔑 `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`: **Required**
* 🤖 `GOOGLE_GENAI_API_KEY`: **Optional**

## 🧪 Notes on Mock Data & Persistence

Many features use `localStorage` for development:

* 🚍 Bus, 🛣️ Route, 👥 User, and 📝 Complaint data are stored locally.
* 🔄 Storage events help sync across tabs.
* 🛠️ Replace with backend (e.g., Firebase, Supabase) for production.

## 🤝 Contributing

Contributions are welcome!
Please follow these steps:

1. 🍴 Fork the repository
2. 🌿 Create a new branch

   ```bash
   git checkout -b feature/your-feature-name
   ```
3. ✏️ Make your changes
4. 💾 Commit your changes

   ```bash
   git commit -m "Add some feature"
   ```
5. 📤 Push to the branch

   ```bash
   git push origin feature/your-feature-name
   ```
6. 📬 Open a Pull Request

## 👥 Contributors

Thanks to the amazing contributors who help improve this project:

| Name                   | Role                 | GitHub                                             |
| ---------------------- | -------------------- | -------------------------------------------------- |
| 🧑‍💻 Shashi     | Lead Developer       | [@Zensphnix](https://github.com/Zensphnix)     |
| 👩‍🎨 Riya | UI/UX Designer       | [@riyagoyalll](https://github.com/riyagoyalll) |
| 🧪 \[Contributor B]    | QA & Testing         | [@contributor-b](https://github.com/contributor-b) |
| 📘 \[Contributor C]    | Documentation Writer | [@contributor-c](https://github.com/contributor-c) |
