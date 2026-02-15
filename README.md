# Amateur Player - Professional Platform

A modern, responsive web application for amateur players to track their progress, connect with others, and improve their performance. Built with Next.js 15, TypeScript, and Tailwind CSS following the BowlersNetwork design system.

## 🎯 Features

- **User Authentication**: Secure sign-in/sign-up with demo mode
- **Performance Dashboard**: Track scores, averages, and achievements
- **Progress Analytics**: Visual metrics and trend analysis
- **Modern UI**: Professional design with the signature green theme (#8BC342)
- **Responsive Design**: Optimized for desktop and mobile devices
- **Goal Tracking**: Set and monitor personal performance goals

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn package manager

### Installation

1. **Clone or download the project**
   ```bash
   cd amateur_player
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔐 Demo Authentication

The application includes a demo authentication system. You can sign in with any email/username and password combination to explore the platform.

**Quick Demo Access:**
- Email: `demo@example.com`
- Password: `password`

## 📱 Key Pages

- **Home Page** (`/`) - Landing page with feature overview
- **Dashboard** (`/dashboard`) - Main user dashboard with analytics
- **Sign In** (`/signin`) - User authentication
- **Sign Up** (`/signup`) - Account creation
- **Messages** (`/messages`) - Community messaging (coming soon)
- **Settings** (`/settings`) - User preferences and account management

## 🎨 Design System

The application follows a professional design system with:

- **Primary Color**: `#8BC342` (Green)
- **Gradients**: `linear-gradient(to right, #8BC342, #6fa332)`
- **Typography**: Geist Sans font family
- **Components**: Consistent spacing, shadows, and interactions
- **Responsive**: Mobile-first design approach

## 🏗️ Architecture

```
src/
├── app/                    # Next.js App Router pages
│   ├── globals.css        # Global styles and CSS variables
│   ├── layout.tsx         # Root layout with fonts and metadata
│   ├── page.tsx          # Home page
│   ├── dashboard/         # Dashboard section
│   ├── auth/             # Authentication pages
│   └── api/              # API routes (Next.js)
├── components/            # Reusable UI components
│   ├── ClientLayout.tsx  # Client-side layout wrapper
│   ├── Navigation.tsx    # Main navigation component
│   ├── ProtectedRoute.tsx # Route protection
│   └── MetricCard.tsx    # Dashboard metric cards
├── contexts/             # React contexts
│   └── AuthContext.tsx   # Authentication state management
├── lib/                  # Utilities and configurations
│   └── api.ts           # API client setup
└── types/               # TypeScript type definitions
    └── index.ts         # Centralized type exports
```

## 🛠️ Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Date Handling**: date-fns

## 📊 Features Overview

### Dashboard Analytics
- Performance metrics with trend indicators
- Recent game history
- Goal progress tracking
- Achievement system

### User Management
- Secure authentication flow
- Profile customization
- Notification preferences
- Privacy controls

### Responsive Design
- Mobile-optimized navigation
- Adaptive layouts
- Touch-friendly interfaces
- Cross-browser compatibility

## 🔧 Development Commands

```bash
# Development server with Turbopack
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Type checking
npm run type-check
```

## 🎯 Customization

The application is built following the BowlersNetwork template and can be easily customized:

1. **Colors**: Update the color system in `tailwind.config.js` and `globals.css`
2. **Branding**: Replace logo and app name in navigation components
3. **Features**: Add new pages and components following the established patterns
4. **API Integration**: Replace demo API routes with real backend services

## 📝 Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_URL=https://your-api.com/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
```

## 🚀 Deployment

The application is ready for deployment on platforms like:

- **Vercel** (Recommended for Next.js)
- **Netlify**
- **AWS Amplify**
- **Docker containers**

For production deployment:

1. Build the application: `npm run build`
2. Configure environment variables
3. Deploy the `.next` folder and dependencies

## 🤝 Contributing

This project follows the BowlersNetwork design system and coding standards. When contributing:

1. Maintain the green color scheme (#8BC342)
2. Follow TypeScript best practices
3. Use Tailwind utility classes
4. Keep components small and focused
5. Add proper error handling

## 📄 License

This project is built for educational and development purposes following the BowlersNetwork template guidelines.

## 🆘 Support

For questions or issues:

1. Check the component patterns in the codebase
2. Review the BowlersNetwork template documentation
3. Ensure all dependencies are properly installed
4. Verify Node.js version compatibility

---

**Built with ❤️ following the BowlersNetwork design system**
