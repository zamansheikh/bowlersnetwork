# Bowlers Network - Amateur Player Platform - Copilot Instructions

## 🎯 Project Overview

This is a **Next.js 15** professional platform for amateur bowling players built with **React 19**, **TypeScript**, and **Tailwind CSS**. The platform enables amateur players to track their progress, connect with other players, view professional player profiles, and manage their bowling journey.

## 🏗️ Project Architecture

### Tech Stack
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **UI**: React 19 + Tailwind CSS
- **State Management**: React Context API (AuthContext)
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Charts**: Recharts
- **Date Handling**: date-fns

### Core Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── globals.css         # Global styles and CSS variables
│   ├── layout.tsx          # Root layout with fonts and metadata
│   ├── page.tsx           # Root redirect logic
│   ├── api/               # API routes (Next.js proxy)
│   ├── landing/           # Landing page with marketing components
│   ├── signin/            # Authentication pages
│   ├── signup/            
│   ├── complete-profile/  # Profile completion flow
│   ├── home/              # Main dashboard/newsfeed
│   ├── pro/               # Professional player profiles (public)
│   ├── pro-players/       # Pro players listing
│   ├── player/            # Amateur player profiles
│   ├── teams/             # Team management
│   ├── messages/          # Chat/messaging
│   ├── products/          # Product marketplace
│   ├── tournaments/       # Tournament system
│   ├── analytics/         # Performance analytics
│   ├── xchange/           # Equipment exchange
│   ├── perks/             # Rewards and perks
│   └── settings/          # User settings
├── components/            # Reusable UI components
│   ├── ClientLayout.tsx   # Client-side layout wrapper
│   ├── Navigation.tsx     # Main navigation with sidebar
│   ├── ProtectedRoute.tsx # Route protection component
│   ├── GlobalHeader.tsx   # Global header component
│   ├── FeedPostCard.tsx   # Social feed post cards
│   ├── PlayerCard.tsx     # Player profile cards
│   └── MetricCard.tsx     # Dashboard metric cards
├── contexts/              # React contexts
│   └── AuthContext.tsx    # Authentication state management
├── lib/                   # Utilities and configurations
│   └── api.ts            # API client setup with interceptors
└── types/                 # TypeScript type definitions
    ├── index.ts           # Core types (User, Auth, etc.)
    └── posts.ts           # Post/feed related types
```

## 🔐 Authentication System

### AuthContext Features
- **Login**: Username/email + password authentication
- **Signup**: Multi-step registration with brand selection
- **Profile Completion**: Mandatory profile completion flow
- **Token Management**: Automatic token refresh and storage
- **Route Protection**: Middleware + client-side protection

### Authentication Flow
1. **Landing Page** (`/landing`) - Marketing page for unauthenticated users
2. **Role Selection** (`/select-your-role`) - User chooses amateur vs pro
3. **Sign In/Up** (`/signin`, `/signup`) - Authentication forms
4. **Profile Completion** (`/complete-profile`) - Required for new users
5. **Home Dashboard** (`/home`) - Main authenticated experience

### Protected vs Public Routes
**Public Routes:**
- `/` (root - redirects based on auth)
- `/landing` - Marketing landing page
- `/signin` - Sign in page
- `/signup` - Sign up page
- `/select-your-role` - Role selection
- `/pro/[id]` - Professional player profiles (viewable without login)

**Protected Routes:**
- `/home` - Main dashboard/newsfeed
- `/complete-profile` - Profile completion (auth required)
- `/player/[id]` - Amateur player profiles
- `/teams/*` - Team management and chat
- `/messages` - Direct messaging
- `/products/*` - Product marketplace
- `/tournaments` - Tournament participation
- `/analytics` - Performance analytics
- `/overview` - Statistics overview
- `/media` - Media gallery
- `/xchange` - Equipment exchange
- `/perks` - Rewards and perks
- `/player-cards` - Player card management
- `/profile` - User profile management
- `/settings` - Account settings

## 🌐 API Integration

### External API Base
- **Production API**: `https://test.bowlersnetwork.com`
- **Authentication**: Bearer token in Authorization header
- **Client**: Axios with interceptors for auth and error handling

### API Routes (Next.js Proxy)
**Authentication:**
- `POST /api/auth/login` - User login (demo implementation)
- `POST /api/auth/signup` - User registration (demo implementation)

**Feedback System:**
- `GET /api/feedback` - Retrieve user feedback
- `POST /api/feedback` - Submit feedback
- `GET /api/feedback-types` - Get feedback categories

**Tournament System:**
- `GET /api/tournaments` - Get all available tournaments
- `POST /api/tournaments` - Create a new tournament
- `POST /api/tournament/[id]/add-singles-member/[playerId]` - Register individual for singles tournament
- `POST /api/tournament/[id]/add-teams-member/[teamId]` - Register team for doubles/teams tournament
- `POST /api/tournaments/[id]/register` - Generic tournament registration
- `DELETE /api/tournaments/[id]/register` - Unregister from a tournament

**Teams Management:**
- `GET /api/user/teams` - Get user's teams
- `GET /api/user/teams/[id]/members` - Get team members

**User Management:**
- `POST /api/send-verification-code` - Send email verification
- `POST /api/verify-email` - Verify email with code
- `POST /api/validate-signup-data` - Validate registration data

### External API Endpoints Used
- `POST /api/amateur-login` - Amateur player authentication
- `POST /api/create-user` - User creation
- `GET /api/user/profile` - User profile retrieval
- `PUT /api/user/profile` - Profile updates
- `GET /api/feedbacks` - Feedback management
- `GET /api/feedback-types` - Feedback categories
- `GET /api/tournaments` - Tournament listings
- `POST /api/tournaments/[id]/register` - Tournament registration
- `DELETE /api/tournaments/[id]/register` - Tournament unregistration

## 🧭 Navigation & Routing

### Main Navigation Items
```typescript
const navigation = [
    { name: 'Newsfeed', href: '/home', icon: Home },
    { name: 'Pro Players', href: '/pro-players', icon: Trophy },
    { name: 'Overview', href: '/overview', icon: BarChart3 },
    { name: 'Media', href: '/media', icon: Play },
    { name: 'Products', href: '/products', icon: Package },
    { name: 'Xchange', href: '/xchange', icon: ShoppingCart },
    { name: 'Perks', href: '/perks', icon: Gift },
    { name: 'Messages', href: '/messages', icon: MessageCircle },
    { name: 'My Teams', href: '/teams', icon: Users },
    { name: 'Analytics', href: '/analytics', icon: Target },
    { name: 'Tournaments', href: '/tournaments', icon: Settings },
    { name: 'Feedback', href: '/feedback', icon: MessageSquare },
];
```

### Navigation Patterns
- **Responsive Design**: Desktop sidebar + mobile drawer
- **Authentication State**: Different navigation for auth/unauth users
- **Pro Route Handling**: Public access to professional player profiles
- **Profile Completion Check**: Redirects incomplete profiles
- **Active State Management**: Highlights current page

### Route Redirect Logic
```typescript
// Root page redirect logic
if (user?.authenticated) {
    router.replace('/home');      // → Authenticated users to dashboard
} else {
    router.replace('/landing');   // → Unauthenticated users to landing
}

// Middleware redirects
if (publicRoutes.includes(pathname) && token && pathname !== '/') {
    return NextResponse.redirect(new URL('/home', request.url));
}
```

## 📱 Key Components

### Core Components
- **`Navigation.tsx`**: Main layout with sidebar, handles auth states
- **`ProtectedRoute.tsx`**: Route protection wrapper
- **`ClientLayout.tsx`**: Client-side layout wrapper for AuthProvider
- **`GlobalHeader.tsx`**: Top navigation header
- **`FeedPostCard.tsx`**: Social media style post cards
- **`PlayerCard.tsx`**: Player profile display cards
- **`MetricCard.tsx`**: Dashboard statistics cards

### Authentication Components
- **Profile Completion Check**: Ensures users complete mandatory profile
- **Auth State Management**: Loading states and error handling
- **Token Persistence**: localStorage + cookie storage

### Landing Page Components
- **Hero Section**: Main marketing content
- **About Section**: Platform information
- **Features**: Platform capabilities showcase
- **Player Cards**: Sample player profiles
- **Testimonials**: User testimonials slider
- **Pricing**: Subscription plans
- **Contact**: Contact information

## 🎨 Design System

### Color Scheme
- **Primary Green**: `#8BC342` (brand color)
- **Dark Green**: `#6fa332` (darker variant)
- **Dark Background**: `#111B05` (sidebar background)
- **Gray Scale**: Standard Tailwind grays
- **Success/Error**: Standard semantic colors

### Typography
- **Primary Font**: Geist Sans
- **Monospace**: Geist Mono
- **Responsive**: Mobile-first approach

### Layout Patterns
- **Sidebar Layout**: Desktop navigation sidebar + main content
- **Mobile Drawer**: Overlay navigation for mobile
- **Card-based UI**: Consistent card layouts
- **Responsive Grid**: Flexible grid systems

## 🔧 Development Guidelines

### State Management
- **Authentication**: React Context (AuthContext)
- **Local State**: useState for component state
- **API State**: Direct async/await with error handling

### API Patterns
- **Centralized Client**: Single axios instance with interceptors
- **Error Handling**: Global error handling in interceptors
- **Loading States**: Component-level loading states
- **Token Management**: Automatic token injection

### Component Patterns
- **Functional Components**: All components use hooks
- **TypeScript**: Strict typing for all props and state
- **Responsive Design**: Mobile-first approach
- **Reusability**: Shared components for common UI patterns

### File Organization
- **Pages**: App Router file-based routing
- **Components**: Organized by functionality
- **Types**: Centralized type definitions
- **API**: Centralized API functions

## 🚀 Key Features

### Social Features
- **Newsfeed**: Social media style feed with posts
- **Player Profiles**: Detailed amateur and pro player profiles
- **Messaging**: Direct messaging between users
- **Teams**: Team creation and management
- **Following**: Follow other players

### Performance Tracking
- **Analytics**: Performance metrics and charts
- **Statistics**: Bowling statistics (average, high scores)
- **Progress Tracking**: XP and level progression
- **Media Gallery**: Game photos and videos

### Marketplace
- **Products**: Bowling equipment marketplace
- **Xchange**: Equipment trading between users
- **Perks**: Rewards and loyalty program

### Tournament System
- **Tournament Listings**: Available tournaments
- **Registration**: Tournament sign-up
- **Results**: Tournament results and rankings

## 🔒 Security & Authentication

### Token Management
- **Bearer Tokens**: API authentication
- **Automatic Refresh**: Token refresh handling
- **Secure Storage**: localStorage + httpOnly cookies
- **Route Protection**: Middleware + client-side guards

### User Permissions
- **Public Access**: Pro player profiles viewable without auth
- **Protected Content**: All amateur features require authentication
- **Profile Completion**: Enforced profile completion flow

## 📋 Common Tasks

### Adding New Routes
1. Create page component in `src/app/[route]/page.tsx`
2. Add to navigation array if needed
3. Update middleware for public/protected routes
4. Add TypeScript types if needed

### API Integration
1. Add function to `src/lib/api.ts`
2. Create Next.js API route if proxy needed
3. Update types in `src/types/`
4. Handle loading and error states

### Component Development
1. Create in `src/components/`
2. Use TypeScript interfaces
3. Follow responsive design patterns
4. Add to index exports if reusable

### Authentication Flow
1. All auth logic in `AuthContext`
2. Use `useAuth()` hook in components
3. `ProtectedRoute` wrapper for protected pages
4. Middleware handles route-level protection

This platform follows modern Next.js patterns with a focus on user experience, performance, and maintainability. The architecture supports both amateur player features and public professional player content.