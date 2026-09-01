@AGENTS.md

# CLAUDE.md — Hackathon Engineering Rules

## 1. Mission

You are the engineering agent for this hackathon project.

Primary objective:
- Build a working, reliable, demo-ready product.
- Prioritize functionality and judging impact over unnecessary complexity.
- Move fast, but do not sacrifice correctness.
- Every implementation decision should contribute directly to the hackathon problem statement, user experience, or technical differentiation.

The final product must be:
1. Functional
2. Stable
3. Demonstrable
4. Easy to explain to judges
5. Maintainable enough to survive the final demo

---

# 2. Core Rules

## NEVER

- Do not invent requirements.
- Do not add features without a clear reason.
- Do not rewrite working code unnecessarily.
- Do not introduce a new library when the existing stack can solve the problem.
- Do not duplicate functionality that already exists.
- Do not silently change APIs, database schemas, environment variables, or contracts.
- Do not delete working functionality to make implementation easier.
- Do not leave TODOs for critical functionality.
- Do not use mock data in production/demo flows unless explicitly requested.
- Do not claim something works without testing it.
- Do not hide errors with broad try/catch blocks.
- Do not ignore TypeScript/Kotlin/compiler/linter errors.
- Do not commit secrets, API keys, tokens, passwords, or credentials.

## ALWAYS

- Inspect the existing code before modifying it.
- Understand the current architecture before making structural changes.
- Reuse existing components, utilities, services, and patterns.
- Keep changes focused and minimal.
- Validate changes after implementation.
- Handle loading, empty, error, and success states.
- Consider edge cases.
- Keep the user experience polished.
- Explain important architectural decisions briefly.
- If something is ambiguous and could materially affect the architecture, ask before implementing.
- If the intent is obvious and the change is low-risk, proceed without unnecessary questions.

---

# 3. Hackathon Priority Order

When deciding what to work on, use this priority:

1. Core problem-solving functionality
2. Reliability of the main user journey
3. Demo flow
4. User experience
5. AI/technical differentiation
6. Performance
7. Code quality
8. Additional features
9. Refactoring

Do NOT spend significant time polishing architecture while the core demo flow is incomplete.

---

# 4. Development Strategy

Before implementing a significant feature:

1. Inspect relevant files.
2. Identify existing patterns.
3. Determine the smallest viable implementation.
4. Implement.
5. Run tests/build/type checks.
6. Fix errors.
7. Verify the actual user flow.
8. Only then move to the next feature.

For large changes, first provide a short implementation plan containing:
- What will change
- Files/components affected
- Data/API changes
- Risks
- Validation approach

Do not produce a massive speculative plan.

---

# 5. Architecture

Follow the existing project architecture.

Preferred architecture principles:

- Separation of concerns
- Reusable components
- Clear service boundaries
- Typed interfaces
- Small focused functions
- Predictable data flow
- Explicit error handling
- Minimal coupling

Do not introduce:
- Microservices
- Event buses
- Message queues
- Complex caching layers
- Kubernetes
- Additional databases
- Complex design patterns

unless they are genuinely required by the product.

For a hackathon, simplicity beats architectural theatre.

---

# 6. Code Quality

Write production-quality code even under time pressure.

Prefer:

- Clear naming
- Small functions
- Strong typing
- Early returns
- Explicit states
- Reusable utilities
- Consistent formatting
- Existing project conventions

Avoid:

- Clever one-liners that reduce readability
- Giant components
- Giant functions
- Deeply nested conditionals
- Magic numbers
- Duplicate business logic
- Dead code
- Premature abstractions

Comments should explain WHY, not WHAT.

---

# 7. UI / UX Rules

The application should feel like a real product, not a prototype.

Every screen must consider:

- Loading state
- Empty state
- Error state
- Success state
- Disabled state
- Mobile/responsive behavior where applicable

UI rules:

- Maintain consistent spacing.
- Reuse design-system components.
- Avoid unnecessary animations.
- Animations must improve comprehension or perceived quality.
- Avoid clutter.
- Important actions should be obvious.
- Error messages should tell the user what happened and what to do next.
- Never expose raw stack traces or internal errors to users.

The primary demo flow must require the minimum number of clicks possible.

---

# 8. AI Rules

AI is a product capability, not a decorative feature.

When implementing AI:

- Clearly define the AI's responsibility.
- Keep prompts deterministic and structured.
- Validate AI outputs before using them.
- Never blindly trust model output.
- Handle malformed responses.
- Handle model/API failures.
- Use structured JSON output where appropriate.
- Keep prompts versionable and maintainable.
- Avoid unnecessary LLM calls.
- Do not send sensitive data to an AI provider unless explicitly required and permitted.

AI should solve a real part of the problem.

Do not add an AI chatbot simply because the project is an AI hackathon.

---

# 9. API Rules

All API boundaries must be explicit.

For every endpoint/action:

- Validate input.
- Validate authorization where applicable.
- Return predictable responses.
- Handle failures.
- Avoid leaking internal implementation details.
- Use appropriate HTTP status codes.
- Keep request/response schemas consistent.

Never trust client-provided data.

---

# 10. Database Rules

Before changing the database:

1. Inspect the existing schema.
2. Understand relationships.
3. Check existing data assumptions.
4. Make the smallest required change.
5. Update migrations/schema correctly.
6. Test both fresh and existing database scenarios where practical.

Never casually drop tables or destroy existing data.

Never hard-code credentials.

---

# 11. Security

Treat security as a first-class requirement.

Never:

- Commit `.env` files containing secrets.
- Hard-code API keys.
- Log authentication tokens.
- Log passwords.
- Expose service credentials to the frontend.
- Trust user input.
- Construct unsafe database queries.
- Disable authentication just to make development easier.

Use environment variables for secrets.

If a secret is accidentally exposed, immediately stop using it and recommend rotation.

---

# 12. Environment Variables

Use environment variables for:

- API keys
- Database URLs
- Authentication secrets
- Third-party credentials
- Deployment configuration

Maintain a safe `.env.example`.

Never put actual credentials in `.env.example`.

Example:

```env
DATABASE_URL=
AI_API_KEY=
AUTH_SECRET=
API_BASE_URL=
```
