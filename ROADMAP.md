# QUANTA Platform Roadmap

> **Mission**: DRIFT research instrumentation (primary) + Pro bono education SaaS (secondary)

---

## Design Principles (Immutable Priority Order)

**Every feature, fix, and decision must respect this hierarchy:**

| Priority | Principle | What It Means |
|----------|-----------|---------------|
| **1** | **Legal Protection** | Grants compliance, tax status, IP protection, liability shields. Never compromise. |
| **2** | **Science** | DRIFT research integrity. Data accuracy, reproducibility, methodological rigor. |
| **3** | **Cost-Efficiency** | Prevent runaway costs. Hard limits everywhere. No unbounded operations. |
| **4** | **Functionality** | Features that work correctly and reliably. |
| **5** | **User-Friendliness** | Polish and UX. Nice to have, never at expense of priorities 1-4. |

### Cost Control Mandate

> **Preventing ridiculous costs must be hardwired into every aspect of this application.**

This is not optional. Every feature must answer:
- What resources does this consume? (compute, storage, API calls)
- What's the maximum cost if abused?
- Where are the hard limits enforced?
- Can an external tenant cause unbounded costs?

---

## Business Model

| Component | Model | Notes |
|-----------|-------|-------|
| **DRIFT** | Internal R&D | Grant-funded, Axion Deep Labs only, not sold |
| **QUANTA Education** | Pro bono SaaS | Free for educational institutions (tax write-off) |
| **Revenue Driver** | Add-on sales | Pay to increase limits beyond free tier |
| **Fallback** | Paid tiers | If costs become burdensome, charge institutions |

---

## Multi-Tenancy Architecture

### Tenant Types

| Tenant Type | Example | Limits | Billing |
|-------------|---------|--------|---------|
| **Axion Deep Labs** | Internal | Unlimited (DRIFT research) | N/A |
| **Educational Institution** | stanford.edu | Hard caps (free tier) | Pro bono |
| **Educational + Add-ons** | mit.edu | Elevated caps | Paid add-ons |
| **Individual (Personal)** | gmail.com user | Minimal caps | Free |

### Limit Enforcement Layers

1. **Database**: Row counts, storage quotas
2. **API**: Rate limiting, request caps per endpoint
3. **UI**: Disable buttons/features when approaching limits
4. **Background Jobs**: Kill long-running processes

---

## Phase 1: Multi-Tenancy Foundation

**Objective**: Tenant isolation and cost protection

### 1.1 Database Models
- [ ] `Organization` model (tenant entity)
- [ ] Update `User` model with `organization_id` FK
- [ ] Add `organization_id` to all data models
- [ ] Create `Plan` and `UsageTracking` models
- [ ] Alembic migrations

### 1.2 Authentication & Signup
- [ ] Domain-based org assignment (`.edu` domains grouped)
- [ ] Personal email users get isolated personal orgs
- [ ] Email verification flow
- [ ] Role system: OWNER, ADMIN, INSTRUCTOR, STUDENT, RESEARCHER
- [ ] User approval flow for non-first users

### 1.3 Tenant Isolation
- [ ] All queries filtered by `organization_id`
- [ ] API dependencies enforce tenant context
- [ ] No cross-tenant data leakage (audit this)

### 1.4 Plan System
- [ ] Define plan tiers with hard limits
- [ ] `free` tier for education (generous but capped)
- [ ] `axion` tier for internal use (unlimited)
- [ ] Usage tracking per org
- [ ] Limit enforcement middleware

---

## Phase 2: Cost Control Infrastructure

**Objective**: Bulletproof cost prevention

### 2.1 Usage Tracking
- [ ] Track simulation runs per org/month
- [ ] Track storage usage per org
- [ ] Track API calls per org/day
- [ ] Monthly reset logic

### 2.2 Hard Limits
- [ ] Simulation runs: block at limit (not warn)
- [ ] Saved circuits: cap count per org
- [ ] Data export: size limits
- [ ] Concurrent users: cap per org

### 2.3 Alerting
- [ ] 80% usage warning (internal, not to user)
- [ ] 100% usage block + admin notification
- [ ] Anomaly detection for abuse patterns

### 2.4 Add-on Purchases (Revenue)
- [ ] Stripe integration for limit upgrades
- [ ] "Buy more simulation runs" flow
- [ ] "Upgrade storage" flow
- [ ] Receipt/invoice generation

---

## Phase 3: DRIFT Research Instrumentation

**Objective**: Internal R&D capabilities for Axion Deep Labs

### 3.1 Experiment Framework
- [ ] Experiment definition model
- [ ] Hypothesis documentation
- [ ] Parameter configuration
- [ ] Operator sequence builder

### 3.2 Execution Engine
- [ ] Batch experiment runs
- [ ] Parameter sweeps
- [ ] Reproducibility (seed control)
- [ ] State snapshots at each step

### 3.3 Data Collection
- [ ] Structured results storage
- [ ] Export formats (CSV, JSON, HDF5)
- [ ] Versioned experiment configs
- [ ] Audit trail for all runs

### 3.4 Analysis Tools
- [ ] Results dashboard
- [ ] Statistical analysis views
- [ ] Visualization exports
- [ ] Jupyter integration

---

## Phase 4: Education Platform (Pro Bono)

**Objective**: Functional education SaaS for institutions

### 4.1 Curriculum Delivery
- [ ] Lesson framework
- [ ] Progress tracking per student
- [ ] Section completion tracking
- [ ] Quiz/assessment engine

### 4.2 Institution Features
- [ ] Instructor dashboard
- [ ] Student roster management
- [ ] Class/cohort organization
- [ ] Progress analytics

### 4.3 Simulation Sandbox
- [ ] Circuit builder (existing)
- [ ] State visualizer (existing)
- [ ] Measurement simulation
- [ ] Export circuits to Qiskit/Cirq format

### 4.4 Institution Onboarding
- [ ] Self-service signup for .edu domains
- [ ] Verification process
- [ ] Welcome flow
- [ ] Quick-start guide

---

## Phase 5: Public-Facing Landing

**Objective**: Unauthenticated marketing/info pages

### 5.1 Landing Page
- [ ] Value proposition
- [ ] Feature overview
- [ ] Target audience messaging
- [ ] CTA to signup/demo

### 5.2 Demo Mode
- [ ] Limited sandbox (no auth required)
- [ ] Sample lesson preview
- [ ] No persistence (localStorage only)
- [ ] Conversion tracking

### 5.3 Institution Partnership
- [ ] "For Universities" page
- [ ] Integration guide
- [ ] Contact/request access form
- [ ] Case studies (when available)

---

## Phase 6: Compliance & Legal

**Objective**: Grant-ready, legally protected

### 6.1 Terms & Policies
- [ ] Terms of Service
- [ ] Privacy Policy (FERPA considerations for .edu)
- [ ] Acceptable Use Policy
- [ ] Data retention policy

### 6.2 Grant Compliance
- [ ] R&D activity logging
- [ ] Time tracking integration
- [ ] Expense categorization
- [ ] Audit-ready documentation

### 6.3 Tax Documentation
- [ ] Pro bono service tracking
- [ ] Fair market value documentation
- [ ] Donation receipts for institutions

---

## Non-Goals (Explicitly Out of Scope)

- AI Tutor / LLM features (removed from scope)
- Real quantum hardware integration (future, not now)
- Mobile native apps (web-first)
- Gamification / badges / achievements
- Social features / forums
- Video content hosting

---

## Success Metrics

| Metric | Target | Why It Matters |
|--------|--------|----------------|
| **Cost per tenant** | < $X/month | Sustainability |
| **Grant qualification** | Pass audit | Funding |
| **Uptime** | 99.5% | Reliability |
| **Data integrity** | 100% | Research validity |
| **Tenant isolation** | 0 leaks | Security/legal |

---

## Review Cadence

- **Weekly**: Progress check against current phase
- **Monthly**: Cost analysis, usage patterns
- **Quarterly**: Roadmap adjustment, priority review

---

*Last Updated: 2026-01-11*
