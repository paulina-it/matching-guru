# 📚 Matching Guru – Frontend

Matching Guru is an intelligent mentor–mentee matching platform designed to optimise university mentoring schemes.  
This repository contains the **frontend application**, built with **Next.js 14 (App Router)**, **TypeScript**, and **TailwindCSS**.

## 🚀 Features
- Secure authentication and signup flows (Participant, Coordinator roles)
- Dynamic multi-step signup forms (Participant and Coordinator)
- Invite-based coordinator registration with secure token validation
- Programme creation and course group assignment
- Participant programme joining with weighted matching criteria
- Matching dashboards for mentors, mentees, and coordinators
- Engagement and matching statistics visualisation
- Profile image upload with Cloudinary integration
- Accessibility-first design with ARIA roles and semantic HTML
- Fully responsive, mobile-friendly layouts
- Smooth user experience using Swiper.js for form flows

## 🛠 Tech Stack
- **Framework**: [Next.js 14](https://nextjs.org/)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **State Management**: React Context (AuthContext)
- **Forms**: Custom inputs and validation
- **API Communication**: Fetch API (with environment variables for endpoints)
- **Authentication**: JWT-based, with session context
- **Component Library**: [shadcn/ui](https://ui.shadcn.dev/)
- **Utilities**: 
  - Swiper.js (multi-step forms)
  - react-hot-toast (notifications)
  - react-spinners (loaders)

## 🏗 Project Structure
```
app/
  api/          → API functions (auth, upload, courses)
  auth/         → Authentication pages (signup, login)
  context/      → AuthContext for session management
  components/   → UI Components (buttons, inputs, forms, cards)
  dashboard/    → Dashboard pages for Participants, Coordinators
  types/        → TypeScript types and enums
public/
  assets/       → Placeholder images, static assets
```

## ⚙️ Setup Instructions

1. **Clone the repository**
```bash
git clone https://github.com/your-org/matching-guru-frontend.git
cd matching-guru-frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
   Create a `.env.local` file:
```
NEXT_PUBLIC_API_URL=https://your-backend-api.com
NEXT_PUBLIC_CLOUDINARY_UPLOAD_URL=https://api.cloudinary.com/v1_1/your-cloud-name/image/upload
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your-upload-preset
```

4. **Run the development server**
```bash
npm run dev
```

The app will be available at http://localhost:3001.
