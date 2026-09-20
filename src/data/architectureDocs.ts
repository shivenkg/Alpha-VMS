/**
 * Architecture Decision Records (ADRs) & Database DDL for VMS
 * Directly fulfilling sections 15, 18, 24, 25 of the Master Specification
 */

export interface ADR {
  id: string;
  title: string;
  status: 'ACCEPTED' | 'PROPOSED' | 'DEPRECATED';
  date: string;
  context: string;
  decision: string;
  consequences: string[];
}

export const ADR_RECORDS: ADR[] = [
  {
    id: 'ADR-001',
    title: 'Cloud-Agnostic Containerized Deployment',
    status: 'ACCEPTED',
    date: '2026-09-15',
    context: 'The enterprise VMS must support hybrid on-premise edge gateways, sovereign private clouds, and public cloud providers (GCP, AWS, Azure) without vendor lock-in.',
    decision: 'Package the application into standard OCI Docker containers with environment-driven configuration, health/liveness probes, and zero cloud-proprietary proprietary SDK coupling.',
    consequences: [
      'Positive: Seamless migration across AWS ECS/EKS, Google Cloud Run/GKE, and on-premises Kubernetes.',
      'Positive: Easy local and edge container runtime with lightweight footprint.',
      'Negative: Requires abstracting storage and queue primitives through unified adapter interfaces.',
    ],
  },
  {
    id: 'ADR-002',
    title: 'Database Per Tenant Isolation Model',
    status: 'ACCEPTED',
    date: '2026-09-15',
    context: 'Medium and large enterprises require strict physical and logical data boundaries for legal, GDPR/CCPA, and compliance segregation.',
    decision: 'Employ a control-plane database registry managing tenant metadata and provisioning, while provisioning an isolated PostgreSQL database schema/instance per tenant.',
    consequences: [
      'Positive: Eliminates cross-tenant SQL injection risk and data leakage at the connection level.',
      'Positive: Granular point-in-time restore, tenant-specific retention purges, and independent schema migration schedules.',
      'Neutral: Requires connection pool routing based on authenticated tenant context claims.',
    ],
  },
  {
    id: 'ADR-003',
    title: 'Flexible OIDC Identity & Claims Mapping',
    status: 'ACCEPTED',
    date: '2026-09-16',
    context: 'Enterprise customers use diverse identity providers (Okta, Azure AD / Microsoft Entra, PingFederate, Google Workspace).',
    decision: 'Implement OpenID Connect (OIDC) Authorization Code Flow with PKCE. Abstract token validation using standard JWKS key rotation, and map incoming claims to Tenant Roles, Site Scopes, and Gate Scopes.',
    consequences: [
      'Positive: Zero credential storage in the VMS database; supports corporate SSO and MFA enforcement.',
      'Positive: Centralized session revocation and token lifetime policy.',
    ],
  },
  {
    id: 'ADR-004',
    title: 'Modular Monolith First Architecture',
    status: 'ACCEPTED',
    date: '2026-09-16',
    context: 'Initial system scale targets medium-enterprise throughput (1,000-10,000 visits/day). Distributed microservices add unnecessary network latency and operational complexity at Phase 1.',
    decision: 'Develop as a structured modular monolith with clear bounded contexts (IAM, Tenant, Visitor, Visit, Badge, Edge, Audit) communicating via well-defined domain services and an in-process transactional outbox.',
    consequences: [
      'Positive: High developer velocity, single atomic transactions, straightforward deployment.',
      'Positive: Ready for independent service extraction when scale boundaries warrant.',
    ],
  },
  {
    id: 'ADR-005',
    title: 'Transactional Outbox Pattern for Notifications & Integration',
    status: 'ACCEPTED',
    date: '2026-09-17',
    context: 'Check-in, approval, and emergency events must reliably trigger WhatsApp/Email alerts without distributed two-phase commits failing business transactions.',
    decision: 'Persist notification events to an `outbox_events` table within the same database transaction as the business entity update. An asynchronous background poller dispatches events with exponential backoff and dead-letter handling.',
    consequences: [
      'Positive: Guarantees at-least-once message delivery even during third-party provider downtime.',
      'Positive: Decouples HTTP request-response cycle from external provider network latency.',
    ],
  },
  {
    id: 'ADR-006',
    title: 'Generic Badge Printer Abstraction & Adapter Framework',
    status: 'ACCEPTED',
    date: '2026-09-17',
    context: 'Physical reception gates deploy various hardware badge printers (Zebra ZPL, Brother ESC/P, Epson ESC/POS, Network Raw Socket).',
    decision: 'Create a generic `BadgePrinterAdapter` contract with unified status polling, ZPL/PDF renderers, and mandatory idempotency key enforcement on all print requests.',
    consequences: [
      'Positive: Zero duplicate thermal labels printed during transient network retries.',
      'Positive: New hardware models plug in via single TypeScript driver adapter.',
    ],
  },
  {
    id: 'ADR-007',
    title: 'Online-First Edge Architecture with Bounded Offline Event Capture',
    status: 'ACCEPTED',
    date: '2026-09-18',
    context: 'Facility gates must continue processing pre-approved visitor entries during temporary WAN or campus network outages.',
    decision: 'Edge gate controllers store an encrypted, time-limited local cache of scheduled day passes. Check-ins performed offline are signed, queued in local encrypted storage, and reconciled automatically with server-authoritative conflict resolution upon reconnect.',
    consequences: [
      'Positive: Uninterrupted physical turnstile operation during ISP blackouts.',
      'Positive: Strict operational boundaries: user administration and policy modifications are disabled in offline mode.',
    ],
  },
  {
    id: 'ADR-008',
    title: 'UTC Timestamp Storage with Site-Level Timezone Presentation',
    status: 'ACCEPTED',
    date: '2026-09-18',
    context: 'Enterprise tenants operate global sites across multiple time zones (e.g. San Jose PST, Austin CST, London GMT, Tokyo JST).',
    decision: 'Persist all database timestamps in UTC (ISO 8601 `timestamptz`). Convert to site-specific timezone in the presentation layer and operational daily reports.',
    consequences: [
      'Positive: Accurate audit sequencing, zero daylight savings transition bugs, unambiguous compliance logs.',
    ],
  },
  {
    id: 'ADR-009',
    title: 'Immutable Audit Trail & Data Retention Compliance',
    status: 'ACCEPTED',
    date: '2026-09-19',
    context: 'Regulatory frameworks (SOC 2 Type II, ISO 27001, OSHA, GDPR) mandate immutable logging of physical facility access and automated data anonymization.',
    decision: 'Implement an append-only `audit_events` table with database-level read-only grants for reporting roles. Automated retention jobs anonymize visitor PII after the tenant-configured retention period while preserving aggregate statistical counts.',
    consequences: [
      'Positive: Fully auditable chain of custody with tamper-detection correlation IDs.',
      'Positive: Compliance with the "Right to be Forgotten" without destroying operational audit integrity.',
    ],
  },
  {
    id: 'ADR-010',
    title: 'Optional Biometric Verification & Privacy Assessment Framework',
    status: 'ACCEPTED',
    date: '2026-09-19',
    context: 'High-security zones may require optional biometric facial or fingerprint verification, subject to strict legal consent.',
    decision: 'Store zero raw biometric vector data in the core VMS database. Biometric workflows interface with certified external hardware providers, storing only an ephemeral verification hash and signed consent timestamp with fallback to photo-ID inspection.',
    consequences: [
      'Positive: Drastically reduces data breach liability and compliance overhead.',
      'Positive: Provides an equitable, non-discriminatory alternative manual check-in workflow.',
    ],
  },
];

export const POSTGRESQL_DDL_SCHEMA = `
-- ============================================================================
-- Enterprise Visitor Management System (VMS) - PostgreSQL Schema DDL
-- Control-Plane & Tenant Data-Plane Schemas (Version: 2026.09.v14)
-- ============================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================
-- 1. CONTROL PLANE SCHEMA (Global Registry)
-- ==========================================
CREATE SCHEMA IF NOT EXISTS control_plane;

CREATE TABLE control_plane.tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(32) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    tier VARCHAR(32) NOT NULL DEFAULT 'ENTERPRISE_PREMIUM',
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    timezone VARCHAR(64) NOT NULL DEFAULT 'UTC',
    locale VARCHAR(16) NOT NULL DEFAULT 'en-US',
    database_ref VARCHAR(128) NOT NULL UNIQUE,
    migration_version VARCHAR(32) NOT NULL DEFAULT '2026.09.v14',
    retention_days INT NOT NULL DEFAULT 365,
    branding_config JSONB NOT NULL DEFAULT '{"primaryColor": "#123B5D", "logoText": "ENTERPRISE"}',
    feature_flags JSONB NOT NULL DEFAULT '{"kioskMode": true, "edgeOfflineEnabled": true}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE control_plane.tenant_provisioning_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES control_plane.tenants(id) ON DELETE CASCADE,
    idempotency_key VARCHAR(128) NOT NULL UNIQUE,
    step VARCHAR(64) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    retry_count INT NOT NULL DEFAULT 0,
    log_output TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE TABLE control_plane.platform_audit_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES control_plane.tenants(id),
    actor_id VARCHAR(64) NOT NULL,
    action VARCHAR(64) NOT NULL,
    details TEXT,
    correlation_id VARCHAR(64) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- 2. TENANT DATA PLANE SCHEMA (Per Tenant)
-- ==========================================
CREATE SCHEMA IF NOT EXISTS tenant_data;

-- Organization Hierarchy
CREATE TABLE tenant_data.sites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(32) NOT NULL,
    timezone VARCHAR(64) NOT NULL DEFAULT 'UTC',
    address TEXT NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    visitor_policy TEXT,
    requires_host_approval BOOLEAN NOT NULL DEFAULT TRUE,
    requires_security_approval BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_site_tenant_code UNIQUE (tenant_id, code)
);

CREATE TABLE tenant_data.building_zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id UUID NOT NULL REFERENCES tenant_data.sites(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(32) NOT NULL,
    security_level VARCHAR(32) NOT NULL DEFAULT 'LOW',
    muster_point VARCHAR(255) NOT NULL,
    max_capacity INT NOT NULL DEFAULT 100,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_zone_site_code UNIQUE (site_id, code)
);

CREATE TABLE tenant_data.gates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id UUID NOT NULL REFERENCES tenant_data.sites(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(32) NOT NULL,
    type VARCHAR(32) NOT NULL DEFAULT 'BIDIRECTIONAL',
    operating_status VARCHAR(32) NOT NULL DEFAULT 'OPEN',
    assigned_printer_id VARCHAR(64),
    assigned_terminal_id VARCHAR(64),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_gate_site_code UNIQUE (site_id, code)
);

CREATE TABLE tenant_data.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(32) NOT NULL UNIQUE,
    lead_approver_id VARCHAR(64),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Identity & RBAC
CREATE TABLE tenant_data.app_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL,
    department_id UUID REFERENCES tenant_data.departments(id),
    site_scopes JSONB NOT NULL DEFAULT '["*"]',
    gate_scopes JSONB NOT NULL DEFAULT '["*"]',
    mfa_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Visitors & Visits
CREATE TABLE tenant_data.visitors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone_number VARCHAR(32) NOT NULL,
    company VARCHAR(255) NOT NULL,
    category VARCHAR(32) NOT NULL,
    document_type VARCHAR(32) NOT NULL,
    masked_document_number VARCHAR(64) NOT NULL,
    encrypted_document_hash VARCHAR(128),
    consent_signed BOOLEAN NOT NULL DEFAULT TRUE,
    consent_signed_at TIMESTAMPTZ,
    nda_signed BOOLEAN NOT NULL DEFAULT FALSE,
    watchlist_status VARCHAR(32) NOT NULL DEFAULT 'CLEAN',
    total_visits INT NOT NULL DEFAULT 0,
    last_visit_at TIMESTAMPTZ,
    is_anonymized BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_visitor_email UNIQUE (email)
);

CREATE TABLE tenant_data.visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id UUID NOT NULL REFERENCES tenant_data.sites(id),
    gate_id UUID REFERENCES tenant_data.gates(id),
    visitor_id UUID NOT NULL REFERENCES tenant_data.visitors(id),
    host_user_id UUID NOT NULL REFERENCES tenant_data.app_users(id),
    department_id UUID REFERENCES tenant_data.departments(id),
    purpose TEXT NOT NULL,
    scheduled_start TIMESTAMPTZ NOT NULL,
    scheduled_end TIMESTAMPTZ NOT NULL,
    actual_check_in TIMESTAMPTZ,
    actual_check_out TIMESTAMPTZ,
    state VARCHAR(32) NOT NULL DEFAULT 'INVITED',
    state_reason TEXT,
    pass_token VARCHAR(128) NOT NULL UNIQUE,
    pass_token_expires_at TIMESTAMPTZ NOT NULL,
    badge_number VARCHAR(64),
    host_approved BOOLEAN NOT NULL DEFAULT FALSE,
    security_approved BOOLEAN NOT NULL DEFAULT FALSE,
    assigned_zone_id UUID REFERENCES tenant_data.building_zones(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Badge & Device Management
CREATE TABLE tenant_data.badge_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(32) NOT NULL,
    width_mm NUMERIC(6,2) NOT NULL,
    height_mm NUMERIC(6,2) NOT NULL,
    show_photo BOOLEAN NOT NULL DEFAULT TRUE,
    show_qr_code BOOLEAN NOT NULL DEFAULT TRUE,
    header_background VARCHAR(16) NOT NULL DEFAULT '#123B5D',
    instructions TEXT
);

CREATE TABLE tenant_data.badge_print_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visit_id UUID NOT NULL REFERENCES tenant_data.visits(id),
    printer_id VARCHAR(64) NOT NULL,
    idempotency_key VARCHAR(128) NOT NULL UNIQUE,
    status VARCHAR(32) NOT NULL DEFAULT 'QUEUED',
    retry_count INT NOT NULL DEFAULT 0,
    is_reprint BOOLEAN NOT NULL DEFAULT FALSE,
    reprint_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Integration & Operations (Outbox, Audit, Edge)
CREATE TABLE tenant_data.outbox_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(64) NOT NULL,
    payload JSONB NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    retry_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    processed_at TIMESTAMPTZ
);

CREATE TABLE tenant_data.audit_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actor_id VARCHAR(64) NOT NULL,
    actor_name VARCHAR(255) NOT NULL,
    actor_role VARCHAR(32) NOT NULL,
    event_type VARCHAR(64) NOT NULL,
    action VARCHAR(32) NOT NULL,
    entity_type VARCHAR(32) NOT NULL,
    entity_id VARCHAR(64) NOT NULL,
    previous_state VARCHAR(32),
    new_state VARCHAR(32),
    details TEXT,
    correlation_id VARCHAR(64) NOT NULL,
    ip_address INET,
    status VARCHAR(32) NOT NULL DEFAULT 'SUCCESS'
);

CREATE TABLE tenant_data.edge_sync_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_guid VARCHAR(128) NOT NULL UNIQUE,
    site_id UUID NOT NULL REFERENCES tenant_data.sites(id),
    gate_id UUID NOT NULL REFERENCES tenant_data.gates(id),
    event_type VARCHAR(64) NOT NULL,
    payload JSONB NOT NULL,
    captured_at_utc TIMESTAMPTZ NOT NULL,
    synced_at_utc TIMESTAMPTZ,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING_UPLOAD',
    hash VARCHAR(128) NOT NULL
);

-- Optimized Performance Indexes
CREATE INDEX idx_visits_state ON tenant_data.visits(state);
CREATE INDEX idx_visits_schedule ON tenant_data.visits(scheduled_start, scheduled_end);
CREATE INDEX idx_visits_pass_token ON tenant_data.visits(pass_token);
CREATE INDEX idx_audit_timestamp ON tenant_data.audit_events(timestamp DESC);
CREATE INDEX idx_audit_correlation ON tenant_data.audit_events(correlation_id);
CREATE INDEX idx_outbox_pending ON tenant_data.outbox_events(status) WHERE status = 'PENDING';
`;

export const MERMAID_ERD_DIAGRAM = `
erDiagram
    TENANTS ||--o{ SITES : hosts
    TENANTS ||--o{ DEPARTMENTS : owns
    TENANTS ||--o{ APP_USERS : employs
    TENANTS ||--o{ VISITORS : registers
    SITES ||--o{ BUILDING_ZONES : contains
    SITES ||--o{ GATES : guards
    SITES ||--o{ VISITS : hosts
    APP_USERS ||--o{ VISITS : hosts_visit
    VISITORS ||--o{ VISITS : attends
    VISITS ||--o{ BADGE_PRINT_JOBS : generates
    VISITS ||--o{ AUDIT_EVENTS : audited_by
    GATES ||--o{ EDGE_SYNC_EVENTS : captures_offline

    TENANTS {
        uuid id PK
        string code UK
        string name
        string tier
        string status
        string database_ref
    }

    SITES {
        uuid id PK
        uuid tenant_id FK
        string code
        string name
        string timezone
        boolean requires_security_approval
    }

    BUILDING_ZONES {
        uuid id PK
        uuid site_id FK
        string name
        string security_level
        string muster_point
    }

    GATES {
        uuid id PK
        uuid site_id FK
        string code
        string name
        string operating_status
    }

    APP_USERS {
        uuid id PK
        string email UK
        string full_name
        string role
        jsonb site_scopes
    }

    VISITORS {
        uuid id PK
        string full_name
        string email UK
        string masked_document_number
        string category
        string watchlist_status
    }

    VISITS {
        uuid id PK
        uuid visitor_id FK
        uuid host_user_id FK
        uuid site_id FK
        uuid gate_id FK
        string state
        string pass_token UK
        timestamp actual_check_in
        timestamp actual_check_out
    }

    BADGE_PRINT_JOBS {
        uuid id PK
        uuid visit_id FK
        string idempotency_key UK
        string status
        boolean is_reprint
    }

    AUDIT_EVENTS {
        uuid id PK
        string actor_id
        string event_type
        string correlation_id
        timestamp timestamp
    }
`;
