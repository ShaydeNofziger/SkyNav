# SkyNav Web

This directory contains the React/Next.js PWA frontend for SkyNav.

## Structure

The web application will be organized into the following structure:

```
web/
├── public/              # Static assets
│   ├── icons/          # PWA icons
│   ├── manifest.json   # PWA manifest
│   └── robots.txt
├── src/
│   ├── app/            # Next.js App Router pages
│   │   ├── page.tsx           # Home / DZ Directory
│   │   ├── dropzones/         # DZ profile pages
│   │   ├── favorites/         # User favorites
│   │   └── admin/             # Admin console
│   ├── components/     # React components
│   │   ├── common/            # Shared UI components
│   │   ├── dropzone/          # DZ-specific components
│   │   ├── map/               # Map components
│   │   └── admin/             # Admin components
│   ├── lib/            # Utilities and helpers
│   ├── hooks/          # Custom React hooks
│   ├── services/       # API client services
│   ├── types/          # TypeScript types
│   └── styles/         # Global styles
└── tests/              # Test files
```

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **UI Library**: React 18
- **Language**: TypeScript
- **Styling**: CSS Modules / Tailwind CSS
- **Maps**: Azure Maps SDK
- **State Management**: React Context / Zustand
- **Forms**: React Hook Form
- **API Client**: Fetch API / Axios
- **Testing**: Vitest + React Testing Library
- **PWA**: next-pwa

## Features

### MVP Features

1. **Dropzone Directory**
   - Paginated/infinite scroll listing
   - Search by name and location
   - Responsive card layout

2. **Dropzone Profile**
   - Detailed DZ information
   - Interactive landing map
   - Community notes display
   - Favorites toggle

3. **Interactive Maps**
   - Azure Maps integration
   - Landing area visualization
   - Hazard and pattern annotations
   - Mobile-optimized controls

4. **Community Notes**
   - Note submission form
   - Approved notes display
   - Character limit validation

5. **Favorites & Travel Mode**
   - Personal DZ collection
   - Travel preparation checklist
   - Quick access dashboard

6. **Admin Console**
   - DZ management (CRUD)
   - Map annotation editor
   - Community note moderation
   - Audit logging

## Development Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test

# Lint code
npm run lint
```

## Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:7071/api
NEXT_PUBLIC_AZURE_MAPS_KEY=your_maps_key
NEXT_PUBLIC_AUTH_DOMAIN=your_auth_domain
```

## PWA Configuration

The app is configured as a Progressive Web App with:
- Service worker for offline capability
- App manifest for installability
- Offline-first strategy for cached DZs
- Push notification support (post-MVP)

## Performance Targets

- **Lighthouse Score**: ≥80 across all categories
- **Time to Interactive**: ≤3s on 4G
- **First Contentful Paint**: ≤1.5s
- **Largest Contentful Paint**: ≤2.5s

## Accessibility

- WCAG 2.1 Level AA compliance
- Semantic HTML
- Keyboard navigation
- Screen reader support
- High contrast support

## Browser Support

- Chrome/Edge (last 2 versions)
- Safari (last 2 versions)
- Firefox (last 2 versions)
- Mobile Safari (iOS 14+)
- Chrome Mobile (Android 10+)

## Testing Strategy

- **Unit Tests**: Component logic and utilities
- **Component Tests**: UI component rendering and interaction
- **Integration Tests**: API integration and data flow
- **E2E Tests**: Critical user flows (Playwright, post-MVP)

---

**Status**: 🚧 Coming in Milestone 1 (Weeks 1-2)
