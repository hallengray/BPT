# Blood Pressure Tracker

**Status**: 🟢 **Production Ready** (pending manual testing)

A modern, accessible blood pressure tracking application built with Next.js 15, React 19, Supabase, and shadcn/ui.

## Features

### Core Features ✅
- 🔐 **Secure Authentication**: Complete auth system with login, signup, and password reset
- 📊 **Blood Pressure Tracking**: Log and visualize your daily BP readings with interactive charts
- 🥗 **Diet Logging**: Track your meals and nutrition
- 🏃 **Exercise Tracking**: Monitor your physical activities
- 👤 **Profile Management**: User profile with settings and account management

### Advanced Features ⭐ NEW
- 💊 **Medication Tracking**: Manage medications, track doses, and monitor adherence with color-coded analytics
- 📈 **Health Analytics**: Correlation analysis between BP, diet, exercise, and medications with interactive timeline
- 🤖 **AI Health Assistant**: Powered by Claude 3.5 Sonnet for personalized health insights, summaries, and advice

### Technical Excellence
- 🎨 **Modern Glass UI**: Beautiful glassmorphism design with gradients and animations
- 🌓 **Dark Mode**: Full dark mode support with smooth transitions
- ♿ **Accessible**: WCAG 2.1 AA compliant with keyboard navigation and screen reader support
- 📱 **Responsive**: Mobile-first design optimized for all devices
- 🔒 **Secure**: Row Level Security (RLS) on all data with input validation
- ⚡ **Fast**: Next.js 16 with Server Components, Streaming, and optimized queries

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) with App Router
- **Language**: [TypeScript 5.6](https://www.typescriptlang.org/) (strict mode)
- **UI Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS 3.4](https://tailwindcss.com/)
- **Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Backend**: [Supabase](https://supabase.com/) (PostgreSQL + Auth + Real-time)
- **Charts**: [Recharts](https://recharts.org/)
- **Validation**: [Zod](https://zod.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase account (free tier available)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/hallengray/BPT.git
cd BPT
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env.local
```

Edit `.env.local` and add your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Get these from: https://app.supabase.com/project/_/settings/api

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/                      # Next.js App Router
│   ├── (auth)/              # Authentication routes
│   │   ├── login/
│   │   ├── signup/
│   │   └── forgot-password/
│   ├── (dashboard)/         # Protected dashboard routes
│   │   ├── dashboard/
│   │   ├── log-bp/
│   │   ├── log-diet-exercise/
│   │   └── profile/
│   ├── actions/             # Server Actions
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Landing page
├── components/              # React components
│   ├── ui/                  # shadcn/ui components
│   ├── forms/               # Form components
│   ├── charts/              # Chart components
│   └── layout/              # Layout components
├── lib/                     # Utility functions
│   ├── supabase/            # Supabase clients
│   ├── validations/         # Zod schemas
│   └── utils.ts             # Helper functions
├── hooks/                   # Custom React hooks
├── types/                   # TypeScript types
└── public/                  # Static assets
```

## Database Schema

The application uses the following Supabase tables:

- `profiles` - User profile information
- `blood_pressure_readings` - BP measurements (systolic, diastolic, pulse)
- `diet_logs` - Meal and nutrition logs
- `exercise_logs` - Physical activity logs

All tables have Row Level Security (RLS) enabled for data isolation.

## Development

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run type-check` - Run TypeScript type checking

### Authentication System ✅ **COMPLETE**

The authentication system has been fully implemented by **Agent Alpha** and includes:

- **Login** (`/login`) - Email/password authentication
- **Signup** (`/signup`) - User registration with email verification
- **Forgot Password** (`/forgot-password`) - Password reset flow
- **Custom Hooks**:
  - `useUser()` - Get current authenticated user
  - `useAuth()` - Full auth utilities (user, loading, signOut)
- **Server Actions**: All auth operations use Next.js 15 Server Actions
- **React 19 Features**: Uses `useActionState` and `useFormStatus`
- **Validation**: Zod schemas with strong password requirements
- **Accessibility**: WCAG 2.1 AA compliant

**Documentation**:
- See `AGENT_ALPHA_COMPLETION_REPORT.md` for full implementation details
- See `AGENT_ALPHA_TESTING_GUIDE.md` for testing instructions

**For Developers**:
```typescript
// Use in any client component
import { useUser } from '@/hooks/use-user'

export function MyComponent() {
  const { user, loading } = useUser()
  
  if (loading) return <div>Loading...</div>
  if (!user) return <div>Please sign in</div>
  
  return <div>Welcome, {user.email}!</div>
}
```

### Code Quality

- **TypeScript Strict Mode**: Enabled for type safety
- **ESLint**: Configured with Next.js recommended rules
- **Prettier**: Automatic code formatting
- **Accessibility**: WCAG 2.1 AA compliance enforced

## Architecture Decisions

### Next.js 15 Patterns

- **Server Components**: Default for optimal performance
- **Server Actions**: Used for all data mutations
- **Streaming**: Implemented with React Suspense
- **Parallel Data Fetching**: Reduces waterfalls

### React 19 Features

- `use()` hook for data fetching
- `useFormStatus()` for form pending states
- `useOptimistic()` for instant UI updates
- Enhanced error boundaries

### Supabase Integration

- `@supabase/ssr` for cookie-based sessions
- Row Level Security (RLS) for data isolation
- Real-time subscriptions for live updates
- Generated TypeScript types for type safety

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the repository in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Environment Variables

Required for production:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Security

- All user data is protected with Row Level Security (RLS)
- Authentication handled by Supabase Auth
- Server Actions include CSRF protection
- Input validation with Zod schemas
- No sensitive data exposed to client

## Accessibility

- Semantic HTML throughout
- ARIA labels on all interactive elements
- Keyboard navigation support
- Screen reader tested
- Color contrast ratios meet WCAG AA standards
- Touch targets minimum 44x44px

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

MIT

## Documentation

- **[Agent Alpha Report](AGENT_ALPHA_COMPLETION_REPORT.md)** - Authentication system implementation
- **[Agent Beta Report](AGENT_BETA_COMPLETION_REPORT.md)** - Dashboard & BP tracking implementation
- **[Agent Gamma Report](AGENT_GAMMA_COMPLETION_REPORT.md)** - Diet & Exercise logging implementation
- **[Agent Delta Report](AGENT_DELTA_COMPLETION_REPORT.md)** - QA, testing, and production readiness
- **[Sprint Review](SPRINT_COMPLETION_REVIEW.md)** - Complete project review
- **[Next Steps](NEXT_STEPS.md)** - Testing and deployment guide

## Quality Metrics

- ✅ **Zero TypeScript Errors**
- ✅ **Zero Linting Errors**
- ✅ **Production Build Succeeds**
- ✅ **Security Audit Passed**
- ✅ **Performance Audit Completed**
- ✅ **WCAG 2.1 AA Compliant**
- ✅ **Mobile Responsive**

## 🚀 Deployment

Ready to deploy? Follow our comprehensive guides:

### Quick Deploy (30 minutes)
See **`QUICK_DEPLOY_CHECKLIST.md`** for a step-by-step checklist to deploy to Vercel.

### Detailed Guide
See **`DEPLOYMENT_GUIDE.md`** for complete deployment instructions including:
- OpenRouter API setup
- Vercel configuration
- Custom domain setup
- Monitoring and analytics
- PWA configuration
- Troubleshooting

### Deployment Checklist
- [ ] Get OpenRouter API key from https://openrouter.ai/keys
- [ ] Push code to GitHub
- [ ] Deploy to Vercel
- [ ] Add environment variables in Vercel
- [ ] Test production deployment
- [ ] Set up monitoring (optional)
- [ ] Add custom domain (optional)

## Disclaimer

This application is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.

## Support

For issues and questions, please open an issue on GitHub.
