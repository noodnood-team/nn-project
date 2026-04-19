# 🐧 Noodnood | Nutrition Fuel Estimation

A mobile-first web application designed for estimating meal nutrition via uploading photos of food.

It is structured to handle photo uploads via a dedicated dropzone, process the image utilizing an internal AI processing loop (mocked for now), and display macro-nutrients sliding up intelligently via a Bottom Sheet layout.

## ✨ Features
- **Mobile-Responsive Shell Component:** Natively resizable dropzone scaling seamlessly for desktop while prioritizing mobile framing.
- **Strict Interaction State Machine:** Hardcoded React cycles handling `IDLE`, `ANALYZING`, `SUCCESS`, and `ERROR` logic intuitively preventing broken uploads.
- **Framer Motion Animations:** Smooth scanning pulses, bottom sheet transitions, and dropzone state fading.
- **Mock API Target:** `POST /api/v1/predict` backend simulation built reliably for UI validation without needing the target Python AI backend active yet. 
- **Error Edge-Case Simulator:** Toggling file names by including "bike" explicitly simulates non-food error rejections.

## 🛠️ Technology Stack
- **Framework:** Next.js 16 (App Router)
- **UI:** React 19
- **Styling:** Tailwind CSS v4 + Arbitrary Configs 
- **Animations:** Framer Motion
- **Icons:** Lucide React

---

## 🚀 Getting Started

### 1. Installation

Navigate into the `frontend` application directory and install the necessary dependencies via Node Package Manager.

```bash
cd frontend
npm install
```

*(Note: Depending on your terminal profile configuration with tools like `mise` or `nvm`, you may need to ensure your environment is sourced correctly or use an interactive shell: `zsh -lc "npm install"`).*

### 2. Run the Development Server

Start the local development server:

```bash
npm run dev
```

### 3. Open the Application

Open your browser and navigate to:
[http://localhost:3000](http://localhost:3000)

---

## 📸 File Testing Mechanics
Because the backend AI logic is currently simulated via our Next.js API route (`frontend/app/api/v1/predict/route.ts`), you can explore the UI constraints using specific file uploads:

- **Upload any normal image file:** The mock server will wait 2.5 seconds and return a successful macro estimation (e.g., 683 kcal, 68g Protein).
- **Upload an image named containing "bike" or "notfood":** The mock server will intentionally fail validation and display the dynamic Error state in the bottom sheet.