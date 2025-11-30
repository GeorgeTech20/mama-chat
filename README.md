# Misha Chat - Health Assistant Frontend

Modern, mobile-first health chatbot frontend application built with React, TypeScript, and Tailwind CSS. Provides a beautiful and intuitive interface for interacting with the Vida health assistant backend.

## Features

- 💬 **Intelligent Chat Interface** - Real-time streaming chat with Misha health assistant
- 📱 **Mobile-First Design** - Optimized for mobile devices with responsive layouts
- 📄 **Document Upload** - Upload medical documents (PDF, JPG, PNG) to your health record
- 🎨 **Modern UI/UX** - Premium health-tech design with soft pastels and smooth animations
- 🔐 **Authentication** - Secure login with Supabase Auth
- 👥 **Patient Management** - Multi-patient support with profile switching
- 📚 **Medical Library** - Browse and manage uploaded medical documents
- ⚡ **Real-time Streaming** - Server-Sent Events (SSE) for live chat responses
- 🌙 **Dark Mode Ready** - Built with CSS variables for theming support

## Prerequisites

- Node.js 18 or higher
- npm or bun package manager
- Vida Backend API running (see [vida-agent](../vida-agent/README.md))
- Supabase project (for authentication)

## Setup

1. **Clone the repository** (if applicable) or navigate to the project directory

2. **Install dependencies**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Configure environment variables**

   Create a `.env` file in the project root directory:
   ```env
   # Supabase Configuration
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-anon-key

   # Vida Backend API URL
   VITE_API_BASE_URL=http://localhost:8080
   ```

   **Note**: The `.env` file is automatically loaded by Vite. Make sure it's in your `.gitignore` to prevent committing secrets.

4. **Start the development server**
   ```bash
   npm run dev
   # or
   bun dev
   ```

   The application will start on `http://localhost:5173`

5. **Build for production**
   ```bash
   npm run build
   # or
   bun run build
   ```

## Project Structure

```
mama-chat/
├── src/
│   ├── main.tsx                    # Application entry point
│   ├── App.tsx                     # Root component with routing
│   ├── index.css                   # Global styles and Tailwind config
│   ├── assets/                     # Static assets (images, icons)
│   │   ├── michi-medic.png        # Misha avatar
│   │   ├── michi-welcome.png      # Welcome screen image
│   │   └── vida-logo.png          # App logo
│   ├── components/                 # Reusable UI components
│   │   ├── ui/                    # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   └── ...                # Other UI primitives
│   │   ├── BottomNav.tsx          # Bottom navigation bar
│   │   ├── MobileLayout.tsx       # Mobile layout wrapper
│   │   ├── HealthProfile.tsx      # Health profile display
│   │   └── PatientSelector.tsx    # Patient switcher component
│   ├── pages/                      # Page components
│   │   ├── Chat.tsx               # Main chat interface
│   │   ├── Home.tsx               # Home dashboard
│   │   ├── Profile.tsx            # User profile page
│   │   ├── MedicalLibrary.tsx     # Medical documents page
│   │   ├── Auth.tsx               # Authentication page
│   │   └── ...                    # Other pages
│   ├── hooks/                      # Custom React hooks
│   │   ├── useChatStream.ts       # Chat streaming hook
│   │   ├── useChatHistory.ts      # Chat history management
│   │   ├── useActivePatient.ts    # Active patient context
│   │   └── use-mobile.tsx         # Mobile detection hook
│   ├── contexts/                   # React contexts
│   │   └── AuthContext.tsx        # Authentication context
│   ├── lib/                        # Utilities and services
│   │   ├── api.ts                 # Backend API service
│   │   └── utils.ts               # Utility functions
│   ├── types/                      # TypeScript type definitions
│   │   └── health.ts              # Health-related types
│   └── integrations/               # Third-party integrations
│       └── supabase/              # Supabase client
│           ├── client.ts
│           └── types.ts
├── public/                         # Public static files
├── index.html                      # HTML entry point
├── vite.config.ts                  # Vite configuration
├── tailwind.config.ts              # Tailwind CSS configuration
├── tsconfig.json                   # TypeScript configuration
└── package.json                    # Project dependencies
```

## Key Components

### Chat Interface (`pages/Chat.tsx`)
The main chat interface with:
- Welcome screen with health concern quick-select buttons
- Real-time streaming message display
- File attachment support
- Markdown rendering (bold text, bullet lists)
- Typing indicators

### API Service (`lib/api.ts`)
Centralized API client for:
- Chat message streaming
- Document upload/download
- Conversation history management
- Patient document retrieval

### Chat Stream Hook (`hooks/useChatStream.ts`)
Custom hook for managing:
- SSE connection to backend
- Message streaming and buffering
- Conversation ID management
- Error handling

## API Integration

The frontend connects to the Vida Backend API:

### Chat Endpoints
- `POST /api/chat/stream` - Stream chat messages via SSE
- `POST /api/chat` - Send chat message (non-streaming)
- `DELETE /api/chat/{conversationId}` - Clear conversation

### Document Endpoints
- `POST /api/documents/upload` - Upload medical documents
- `GET /api/documents/patient/{patientId}` - Get patient documents
- `GET /api/documents/{documentId}/download` - Download document
- `DELETE /api/documents/{documentId}` - Delete document

## Technologies

- **React 18** - UI library with hooks
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful, accessible UI components
- **React Router** - Client-side routing
- **Supabase** - Authentication and database
- **Sonner** - Toast notifications
- **Lucide React** - Beautiful icons

## Scripts

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint

# Type checking
npx tsc --noEmit     # Check TypeScript types
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Supabase project URL | Yes |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/public key | Yes |
| `VITE_API_BASE_URL` | Vida Backend API URL | Yes (defaults to localhost:8080) |

## License

This project is open source and available for use.

## Support

For issues or questions, please open an issue in the repository.
