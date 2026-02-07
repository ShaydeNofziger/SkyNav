# Architecture Decision Records (ADRs)

This directory contains Architecture Decision Records (ADRs) for the SkyNav project. ADRs document significant architectural decisions made during the development of the system.

## What is an ADR?

An Architecture Decision Record (ADR) is a document that captures an important architectural decision made along with its context and consequences. ADRs help teams:

- Understand why decisions were made
- Evaluate alternatives that were considered
- Communicate architectural choices to new team members
- Revisit decisions when requirements change
- Maintain institutional knowledge

## ADR Format

Each ADR follows this structure:

1. **Title**: Clear, descriptive title of the decision
2. **Status**: Accepted, Proposed, Deprecated, or Superseded
3. **Context**: Problem statement and requirements
4. **Decision**: The choice that was made
5. **Rationale**: Why this decision was made
6. **Consequences**: Positive and negative impacts
7. **Alternatives**: Other options considered and why they were not chosen

## Active ADRs

| ID | Title | Status | Date |
|----|-------|--------|------|
| [ADR-001](./001-backend-technology.md) | Backend Technology Selection | Accepted | 2026-02-07 |
| [ADR-002](./002-authentication-strategy.md) | Authentication Strategy | Accepted | 2026-02-07 |
| [ADR-003](./003-data-storage-approach.md) | Data Storage Approach | Accepted | 2026-02-07 |

## Creating a New ADR

When making a significant architectural decision:

1. Copy the ADR template (create one based on existing ADRs)
2. Number it sequentially (e.g., `004-decision-name.md`)
3. Fill in all sections with context and rationale
4. Consider alternatives and document why they were rejected
5. Discuss with team (if applicable)
6. Update this README with the new ADR

## When to Create an ADR

Create an ADR when:

- Choosing between major technology alternatives
- Making decisions that are difficult or expensive to reverse
- Selecting architectural patterns or approaches
- Deciding on security, scalability, or performance strategies
- Establishing coding conventions or project structure

Do NOT create an ADR for:

- Minor implementation details
- Obvious or trivial choices
- Temporary decisions that will be revisited soon
- Personal preferences without architectural impact

## Reviewing and Updating ADRs

ADRs should be:

- **Reviewed** when context changes or new information emerges
- **Superseded** when a decision is reversed (create new ADR, link to old one)
- **Deprecated** when no longer applicable
- **Referenced** in code comments or documentation when relevant

ADRs are not updated to reflect new decisions. Instead, create a new ADR that supersedes the old one.

## Related Documentation

- [System Architecture Overview](../architecture.md)
- [SkyNav MVP Specification](../../SkyNav%20MVP%20Specification.pdf)
- [Infrastructure Guide](../../infra/README.md)

---

**Document Maintenance**

Update this README when:
- New ADRs are created
- ADRs are deprecated or superseded
- The ADR process changes
