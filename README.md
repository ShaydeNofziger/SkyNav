# SkyNav

![Deploy API](https://github.com/ShaydeNofziger/SkyNav/actions/workflows/deploy-api.yml/badge.svg)
![Deploy Web](https://github.com/ShaydeNofziger/SkyNav/actions/workflows/deploy-web.yml/badge.svg)

**Dropzone Intelligence for Traveling Skydivers**

SkyNav is a mobile-first progressive web application (PWA) that provides skydivers with structured operational intelligence for unfamiliar dropzones. The platform replaces fragmented word-of-mouth knowledge with a centralized, community-enriched repository of dropzone information, landing area intelligence, hazard awareness data, and travel preparation tools.

## 🎯 Product Vision

Skydivers traveling to unfamiliar dropzones face a significant safety and experience gap. Critical operational knowledge — landing area layouts, local hazards, pattern conventions, and facility logistics — is typically exchanged informally through social media groups, word-of-mouth, or discovered on arrival. This fragmented information ecosystem creates unnecessary risk, particularly for intermediate-level jumpers who may lack the network or experience to know what questions to ask.

**SkyNav provides a single, structured source of dropzone intelligence** that a skydiver can consult before arriving at a new DZ. The platform combines:

- **Structured operational data** curated by administrators (DZ profiles, landing maps, hazard annotations)
- **Community-contributed insights** moderated for accuracy (community notes)
- **Personal utility tools** for trip planning (favorites, travel mode)

## 🚀 MVP Features

### ✅ Implemented Features

1. **User Authentication** - Azure AD B2C integration with JWT-based auth
2. **User Profile Management** - Personal profile with skydiving credentials and preferences
3. **Trip Planning** - Create and manage skydiving trips with dates and destinations
4. **Travel Logistics** - Track flights, drives, and lodging for each trip
5. **Dropzone Directory** - Public API endpoint for browsing dropzones

### 🚧 In Progress / Planned MVP Features

6. **Dropzone Detail Pages** - Comprehensive dropzone profiles with operational details
7. **Interactive Landing Maps** - Azure Maps-powered landing area visualization with hazards
8. **Community Notes** - Moderated community contributions for real-world insights
9. **Favorites & Travel Mode** - Personal DZ collections with travel preparation checklists
10. **Admin Console** - Content management for dropzones, maps, and community notes

See [docs/roadmap.md](./docs/roadmap.md) for detailed roadmap and post-MVP features.

## 🏗️ Repository Structure

```
/
├── src/
│   ├── api/          # Azure Functions backend (Node.js/TypeScript)
│   └── web/          # React/Next.js PWA frontend
├── infra/            # Infrastructure as Code (Azure deployment configs)
├── docs/             # Project documentation
└── SkyNav MVP Specification.pdf
```

## 🛠️ Technology Stack

- **Frontend**: React, Next.js, TypeScript, Azure Maps SDK
- **Backend**: Azure Functions (serverless)
- **Database**: Azure Cosmos DB (SQL API)
- **Storage**: Azure Blob Storage
- **Maps**: Azure Maps
- **Authentication**: Azure AD B2C (or Auth0/Clerk)
- **Deployment**: Azure Static Web Apps + Functions
- **CI/CD**: GitHub Actions

## 📱 Target Users

### Primary Persona: The Traveling Jumper
- **Experience Level**: Intermediate to advanced (100+ jumps)
- **Behavior**: Visits 2–5 unfamiliar DZs per year
- **Pain Point**: Arrives at a new DZ without knowledge of landing areas, hazards, or local procedures
- **Goal**: Jump safely and confidently without relying on finding the right person to ask
- **Device**: Primarily mobile (phone), occasionally tablet or laptop

### Secondary Persona: The Instructor/Coach
- **Experience Level**: Expert (1000+ jumps, rated instructor or coach)
- **Behavior**: Travels to DZs for events, boogies, coaching gigs
- **Pain Point**: Needs quick landing area reference when coaching visiting students
- **Goal**: Verify local procedures quickly to provide accurate guidance

### Tertiary Persona: The DZ Regular
- **Experience Level**: Any
- **Behavior**: Primarily jumps at their home DZ
- **Goal**: Share accurate intel about their home DZ via community notes

## 🎯 Product Principles

| Principle | Description |
|-----------|-------------|
| **Safety First** | Every feature should reduce risk for visiting skydivers. Information accuracy is non-negotiable. |
| **Utility Over Volume** | Fewer features, deeply useful. No feature bloat. |
| **Mobile-First** | The primary use case is a skydiver checking their phone before a jump or during travel. |
| **Community Trust** | All community content passes through moderation. No unverified information reaches end users. |
| **Progressive Enrichment** | Start with admin-seeded content, layer community input over time. |

## 📈 Key Metrics (MVP)

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Dropzones seeded at launch | 5–10 | Manual count |
| Profile completeness score | ≥ 80% fields populated | Automated audit |
| Time to find DZ info | < 30 seconds | User testing observation |
| Community note approval rate | ≥ 60% of submissions | Moderation pipeline metrics |
| Return user rate (30-day) | ≥ 40% | Analytics |

## 🚫 Explicit Non-Goals (MVP)

The following are intentionally excluded from the MVP to maintain scope discipline:

- AI-assisted jump planning
- Automated weather ingestion
- Social networking features (beyond community notes)
- Real-time collaboration
- Native mobile builds (iOS/Android) — PWA provides sufficient mobile experience
- User-to-user messaging
- DZ rating/review system
- Automated DZ data import

## 📅 Development Timeline

**Estimated MVP Duration**: 10–13 weeks (solo builder)

1. **Foundation & Infrastructure** (Weeks 1–2)
2. **Dropzone Directory** (Weeks 3–4)
3. **Interactive Map** (Weeks 5–7)
4. **Community Notes** (Weeks 8–9)
5. **Favorites & Travel Mode** (Week 10)
6. **Admin Console** (Weeks 11–12)
7. **MVP Polish & Testing** (Week 13)

## 🔒 Security & Privacy

- JWT-based authentication
- Role-based access control (RBAC)
- All community content moderated before publication
- Secure API endpoints with proper authorization
- Data privacy compliance (GDPR considerations)

## 🛠️ Local Development Setup

### Prerequisites

- **Node.js** 24+ and npm
- **Azure Functions Core Tools** (for API development)
- **Azure Cosmos DB Emulator** (optional for local database)
- **Git**

### API Setup

```bash
# Navigate to API directory
cd src/api

# Install dependencies
npm install

# Copy environment template
cp local.settings.example.json local.settings.json

# Edit local.settings.json with your configuration:
# - Cosmos DB connection (use emulator or cloud instance)
# - Azure AD B2C credentials
# - Azure Maps subscription key

# Build the TypeScript code
npm run build

# Start Azure Functions runtime (runs on http://localhost:7071)
func start
# or use npm script
npm run watch  # Watches for changes and rebuilds
```

**Note**: The API requires a Cosmos DB instance. You can:
- Install the [Azure Cosmos DB Emulator](https://learn.microsoft.com/en-us/azure/cosmos-db/local-emulator) (Windows/Docker)
- Use a free tier Azure Cosmos DB account
- See `local.settings.example.json` for required configuration

### Web Setup

```bash
# Navigate to web directory
cd src/web

# Install dependencies (use --legacy-peer-deps due to React version conflicts)
npm install --legacy-peer-deps

# Copy environment template
cp .env.example .env.local

# Edit .env.local with your configuration:
# - NEXT_PUBLIC_API_URL (points to local API: http://localhost:7071/api)
# - Azure AD B2C tenant details
# - Azure Maps subscription key

# Start development server (runs on http://localhost:3000)
npm run dev
```

### Running the Full Stack Locally

1. Start the API in one terminal: `cd src/api && func start`
2. Start the web app in another terminal: `cd src/web && npm run dev`
3. Open http://localhost:3000 in your browser
4. Sign in with Azure AD B2C to test authenticated features

### Seeding Test Data

```bash
# From the API directory, seed dropzones into your database
cd src/api
npm run seed-dropzones
```

## 🚀 Deployment

SkyNav uses GitHub Actions for automated CI/CD deployments to Azure:

- **Automatic Deployment**: Pushes to `main` automatically deploy to production
- **Preview Deployments**: Pull requests create preview environments
- **Manual Deploys**: One-click deployments via GitHub Actions

**Quick Deployment**:
```bash
# Merge to main - deploys automatically
git push origin main
```

**Documentation**:
- 📖 [Deployment Guide](./docs/DEPLOYMENT.md) - Complete deployment documentation
- ⚡ [Release Process](./docs/RELEASE_PROCESS.md) - Quick reference for releases
- 🏗️ [Infrastructure Setup](./infra/README.md) - Azure resource provisioning
- 🔑 [Secrets Configuration](./.github/SECRETS.md) - Required GitHub secrets

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

This is currently a solo project in MVP development phase. Community contributions and feedback will be welcomed after the initial release.

## 📧 Contact

**Author**: Shayde Nofziger  
**Project Codename**: SkyNav  
**Document Version**: 1.0

## 🔗 Resources

- [Full MVP Specification](./SkyNav%20MVP%20Specification.pdf)
- [Azure Maps Documentation](https://learn.microsoft.com/en-us/azure/azure-maps/)
- [Azure Functions Documentation](https://learn.microsoft.com/en-us/azure/azure-functions/)
- [Next.js Documentation](https://nextjs.org/docs)
- [USPA Dropzone Directory](https://uspa.org/find/dropzones)

---

**Status**: 🚧 MVP Development in Progress  
**Last Updated**: February 7, 2026
