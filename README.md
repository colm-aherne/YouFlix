
YouFlix

YouFlix is a web application that bridges the gap between YouTube and Netflix, combining a slick, Netflix-style user interface with YouTube's vast media streaming capability. Built on top of Next.js, Firebase, and Bun, it provides a cinematic layout for browsing, searching, and streaming your favorite video content.

🚀 Features

• Netflix-Style UI: Sleek rows, rich modern grids, and an intuitive media player dashboard.
• YouTube Integration: Direct rendering and streaming integration utilizing YouTube video content.
• Firebase Backend: Real-time Firestore database integration for user profiles, watchlists, or video metadata storage.
• Tailwind CSS Engine: Fast, highly optimized utility-first styling for fluid responsiveness across desktop and mobile.
• Modern Tooling: Powered by Bun runtime engine for lightning-fast package management and Next.js for server-side rendering (SSR) and routing.

🛠️ Project Structure

text
├── app/                  # Next.js App Router pages and layouts
├── components/           # Reusable UI components (Carousels, Video Players, Cards)
├── context/              # React Context providers (Auth, Global State)
├── data/                 # Local mock datasets or static structural configuration
├── hooks/                # Custom React hooks
├── lib/                  # Initialization helpers (Firebase setup, API clients)
├── src/assets/images/    # Application images, logos, and icons
├── types/                # TypeScript type definitions and interfaces
Use code with caution.

⚙️ Prerequisites

Ensure you have the following installed on your local machine:
• Bun (Recommended) or Node.js (v18+)
• A Firebase Project configuration

📥 Getting Started

1. Clone the repository:bash
git clone https://github.com
cd YouFlix
Use code with caution.
2. Install dependencies:bash
bun install
Use code with caution.
(Alternatively, use npm install or yarn install if not using Bun)
3. Configure Environment Variables:
Duplicate the .env.example file and rename it to .env.local:bash
cp .env.example .env.local
Use code with caution.
Open .env.local and populate it with your Firebase config credentials and your YouTube Data API keys.
4. Run the development server:bash
bun dev
Use code with caution.
5. Open the app:
Navigate to http://localhost:3000 inside your browser to view the application.

🔥 Firebase Setup

The repository comes packaged with security configurations ready for deployment:
• firestore.rules: Controls data validation rules and access constraints.
• Ensure you deploy these to your Firebase console instance using the Firebase CLI tool (firebase deploy --only firestore).
