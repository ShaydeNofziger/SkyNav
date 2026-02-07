# Documentation

This directory contains project documentation for SkyNav.

## Contents

- **[SkyNav MVP Specification.pdf](../SkyNav%20MVP%20Specification.pdf)**: Comprehensive product specification document (see parent directory)
- **[Architecture Overview](./architecture.md)**: System architecture, design principles, and technology stack
- **[Architecture Decision Records (ADRs)](./adr/)**: Key architectural decisions and their rationale

## Documentation Structure

### Technical Documentation

- **[Architecture](./architecture.md)**: System architecture diagrams and design decisions ✅
  - Mobile-first web app approach
  - API-first backend architecture
  - Azure hosting model and infrastructure
- **[ADRs](./adr/)**: Architecture Decision Records ✅
  - [ADR-001: Backend Technology Selection](./adr/001-backend-technology.md)
  - [ADR-002: Authentication Strategy](./adr/002-authentication-strategy.md)
  - [ADR-003: Data Storage Approach](./adr/003-data-storage-approach.md)
- **API Documentation**: REST API endpoint specifications ✅
  - [Dropzone Directory API](./api/dropzone-directory.md)
  - [Trip API](./api/trip.md)
- **Database Schema**: Data models and relationships ✅
  - [Domain Models](../src/api/src/models/README.md)
  - [DTOs](../src/api/src/dtos/README.md)
- **Deployment Guide**: Step-by-step deployment instructions (Planned)
- **Development Guide**: Setup and development workflow (Planned)

### User Documentation

- **User Guide**: End-user documentation for skydivers
- **Admin Guide**: Administrative console usage guide
- **FAQ**: Frequently asked questions

### Process Documentation

- **Contributing Guidelines**: How to contribute to the project
- **Code Review Standards**: Code review checklist and standards
- **Testing Strategy**: Testing approach and guidelines
- **Release Process**: Version management and release workflow

## Quick Links

### MVP Specification Highlights

- **Executive Summary**: Pages 1-2
- **Product Vision**: Page 2
- **Target Users**: Pages 3-4
- **MVP Scope**: Pages 4-5
- **Functional Requirements**: Pages 5-10
- **System Architecture**: Page 13
- **Technology Stack**: Page 14
- **Development Timeline**: Pages 28-32

### Key Concepts

**DZ (Dropzone)**: A facility where skydiving operations are conducted

**Landing Pattern**: The standardized flight path canopy pilots follow during approach

**Swoop/Swooping**: High-performance canopy landing involving a high-speed approach

**Manifest**: The DZ's scheduling system for assigning jumpers to aircraft loads

**Boogie**: A skydiving event or festival, often attracting traveling jumpers

## Documentation Standards

When adding documentation:

1. **Use Markdown**: All documentation should be in Markdown format (.md)
2. **Clear Headers**: Use proper heading hierarchy
3. **Code Examples**: Include code blocks with syntax highlighting
4. **Screenshots**: Add visual examples where helpful
5. **Links**: Cross-reference related documentation
6. **Versioning**: Include version and last updated date
7. **Accessibility**: Write clearly for all skill levels

## Documentation TODO

- [x] Create architecture overview document
- [x] Add architecture decision records (ADRs)
- [ ] Create API specification document
- [ ] Add architecture diagrams
- [ ] Write deployment guide
- [ ] Create user onboarding guide
- [ ] Document database schema
- [ ] Add code examples and tutorials
- [ ] Create admin console guide
- [ ] Write testing documentation
- [ ] Add security best practices
- [ ] Create troubleshooting guide

---

**Status**: 🚧 Coming in Milestone 1-7

**Note**: Additional documentation will be added progressively throughout the MVP development milestones.
