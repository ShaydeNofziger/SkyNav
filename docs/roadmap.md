# SkyNav Roadmap

This document outlines the development roadmap for SkyNav, including completed features, MVP work in progress, and post-MVP enhancements.

**Last Updated**: February 7, 2026

---

## ✅ Phase 1: Foundation & Core Features (COMPLETED)

### Infrastructure & Authentication
- [x] Azure infrastructure setup (Cosmos DB, Functions, Static Web Apps)
- [x] GitHub Actions CI/CD pipelines for API and web deployments
- [x] Azure AD B2C authentication integration
- [x] JWT-based API authentication middleware
- [x] User provisioning on first login

### User Profile Management
- [x] User profile data model
- [x] Profile API endpoints (GET/PUT /api/users/me)
- [x] Profile UI page with edit capabilities
- [x] Skydiving credentials tracking (license, ratings, jump count)

### Trip Planning System
- [x] Trip data model with CRUD operations
- [x] Trip API endpoints (POST/GET/PUT/DELETE /api/trips)
- [x] Trip list and detail pages
- [x] Trip form components with validation

### Travel Logistics Tracking
- [x] Travel segment data model (flights, drives, lodging)
- [x] Travel segment API endpoints (CRUD)
- [x] Segment form components for each type
- [x] Timeline-based trip detail view

### Dropzone Directory (Basic)
- [x] Dropzone data model
- [x] Public dropzone listing API (GET /api/dropzones)
- [x] Dropzone seeding scripts
- [x] Directory page UI skeleton

---

## 🚧 Phase 2: MVP Completion (IN PROGRESS)

### Dropzone Detail Pages
- [ ] Individual dropzone profile pages
- [ ] Detailed operational information display
- [ ] Facility and service information
- [ ] Contact and hours display
- [ ] Aircraft and altitude information

### Interactive Landing Maps
- [ ] Azure Maps SDK integration
- [ ] Landing area visualization
- [ ] Map annotation data model
- [ ] Hazard and pattern overlays
- [ ] Mobile-optimized map controls
- [ ] Zoom and pan interactions

### Community Notes
- [ ] Community note data model
- [ ] Note submission API endpoints
- [ ] Note submission form
- [ ] Note display on dropzone pages
- [ ] Admin moderation API endpoints
- [ ] Moderation queue UI
- [ ] Note approval/rejection workflow

### Favorites & Travel Mode
- [ ] User favorites data model
- [ ] Favorites API endpoints (GET/POST/DELETE)
- [ ] Favorites toggle on dropzone pages
- [ ] Favorites list page
- [ ] Travel mode checklist feature
- [ ] Travel preparation utilities

### Admin Console
- [ ] Admin role-based access control
- [ ] Dropzone management UI (CRUD)
- [ ] Dropzone form with all fields
- [ ] Map annotation editor
- [ ] Annotation drawing tools
- [ ] Community note moderation dashboard
- [ ] Audit logging for admin actions

### MVP Polish & Testing
- [ ] Comprehensive end-to-end testing
- [ ] Performance optimization
- [ ] Accessibility audit (WCAG 2.1 Level AA)
- [ ] Mobile responsiveness testing
- [ ] Cross-browser testing
- [ ] Security audit
- [ ] Documentation completion

**Target Completion**: End of Q1 2026

---

## 🎯 Phase 3: Post-MVP Enhancements (FUTURE)

> **Note**: The following features are explicitly **post-MVP** and will be considered after the core MVP is complete, stable, and validated with real users.

### Enhanced Search & Discovery
- [ ] Advanced search with multiple filters
- [ ] Search by location/proximity
- [ ] Search by services (tandem, AFF, wind tunnel)
- [ ] Search by aircraft type
- [ ] Full-text search across all dropzone data
- [ ] Search history and saved searches

### Weather Integration
- [ ] Real-time weather data for dropzones
- [ ] Wind conditions and forecast
- [ ] Weather alerts and notifications
- [ ] Historical weather patterns
- [ ] Jump conditions indicator (green/yellow/red)

### Social Features
- [ ] User-to-user messaging
- [ ] Dropzone check-ins
- [ ] Jump logging integration
- [ ] Friend connections
- [ ] Activity feed
- [ ] Jump buddy finder

### Advanced Trip Planning
- [ ] Multi-dropzone trip itineraries
- [ ] Route optimization suggestions
- [ ] Cost estimation tools
- [ ] Accommodation booking integration
- [ ] Calendar integration (Google/Apple)
- [ ] Shared trip planning with other users

### Rating & Review System
- [ ] Dropzone ratings (1-5 stars)
- [ ] Written reviews with moderation
- [ ] Review helpfulness voting
- [ ] Response from dropzone owners
- [ ] Rating breakdowns by category
- [ ] Photo uploads with reviews

### Native Mobile Apps
- [ ] iOS native app (Swift/SwiftUI)
- [ ] Android native app (Kotlin/Jetpack Compose)
- [ ] Push notifications
- [ ] Offline mode enhancements
- [ ] Device-specific optimizations
- [ ] App Store and Play Store publishing

### AI-Powered Features
- [ ] AI-assisted jump planning
- [ ] Smart trip suggestions based on preferences
- [ ] Personalized dropzone recommendations
- [ ] Natural language search
- [ ] Automated hazard detection from maps
- [ ] Weather condition analysis and advice

### Analytics & Insights
- [ ] Personal jump statistics dashboard
- [ ] Trip history and analytics
- [ ] Favorite dropzone patterns
- [ ] Community insights and trends
- [ ] Popular destinations by season
- [ ] Travel statistics

### Advanced Map Features
- [ ] 3D terrain visualization
- [ ] Satellite imagery layers
- [ ] Historical landing patterns
- [ ] Wind pattern visualization
- [ ] Custom map layers
- [ ] Offline map downloads

### Integration & API
- [ ] Public API for third-party integrations
- [ ] Burble integration (jump manifesting)
- [ ] USPA membership verification
- [ ] Logbook app integrations
- [ ] Weather service integrations
- [ ] Flight booking API integrations

### Gamification & Engagement
- [ ] Achievement badges
- [ ] Dropzone explorer challenges
- [ ] Travel milestones
- [ ] Community leaderboards
- [ ] Referral program
- [ ] Seasonal events and challenges

### Internationalization
- [ ] Multi-language support
- [ ] Currency conversion
- [ ] International dropzone coverage
- [ ] Regional regulatory information
- [ ] Localized content and translations
- [ ] Right-to-left language support

### Accessibility Enhancements
- [ ] Screen reader optimizations
- [ ] High contrast mode
- [ ] Keyboard-only navigation
- [ ] Voice control support
- [ ] Text size customization
- [ ] Color blindness modes

---

## 📊 Success Metrics

### MVP Launch Metrics
- Dropzones seeded at launch: 5-10 (target)
- Profile completeness: ≥80% of fields populated
- Time to find DZ info: <30 seconds
- Community note approval rate: ≥60%
- 30-day return user rate: ≥40%

### Post-MVP Growth Metrics
- Monthly active users (MAU)
- Dropzone coverage (% of USPA DZs)
- Community note contribution rate
- Average session duration
- Trip creation rate
- User satisfaction (NPS score)

---

## 🚫 Explicit Non-Goals

The following are intentionally out of scope for SkyNav:

- **Jump Manifesting**: We integrate with existing systems (Burble, Manifest) rather than competing
- **Equipment Sales**: We're not an e-commerce platform
- **Training Platform**: We don't replace instructor-led training
- **Video Hosting**: We link to existing platforms (YouTube, Vimeo)
- **Payment Processing**: We don't handle dropzone payments
- **Real-time Chat**: Focus on structured information over messaging
- **Social Media Clone**: We're a utility app, not a social network

---

## 📅 Timeline Overview

| Phase | Timeline | Focus |
|-------|----------|-------|
| Phase 1: Foundation | Weeks 1-7 | ✅ Authentication, profiles, trips, travel logistics |
| Phase 2: MVP Completion | Weeks 8-13 | 🚧 DZ details, maps, notes, favorites, admin |
| Phase 3: Post-MVP | Q2 2026+ | 🎯 Search, weather, social, ratings, mobile apps |

---

## 🔄 Roadmap Updates

This roadmap is a living document and will be updated regularly as:
- MVP features are completed
- User feedback is collected
- Market needs evolve
- Technical constraints change
- Resources and priorities shift

**Review Cadence**: Monthly during MVP phase, Quarterly post-launch

---

## 📝 Feature Requests

Have an idea for SkyNav? We welcome community input!

- Post-MVP feature suggestions: Create a GitHub Discussion
- Bug reports: Open a GitHub Issue
- Urgent security concerns: Email the maintainer directly

---

**Document Version**: 1.0  
**Status**: 🚧 MVP Development in Progress  
**Next Review**: March 2026
