import { storageService } from './storageService';

export interface ApiEndpointDef {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  path: string;
  group: 'Authentication & Context' | 'Tenants & Sites' | 'Users & Authorization' | 'Visitors & Visits' | 'Invitations & Approvals' | 'Badges & Devices' | 'Audit & Operations';
  summary: string;
  description: string;
  requiredRole: string;
  sampleBody?: Record<string, unknown>;
}

export const API_CATALOG: ApiEndpointDef[] = [
  // Auth & Context
  {
    method: 'GET',
    path: '/api/v1/me',
    group: 'Authentication & Context',
    summary: 'Get current authenticated user identity & claims',
    description: 'Returns the authenticated profile, tenant association, mapped roles, and site/gate scopes.',
    requiredRole: 'Any Authenticated User',
  },
  {
    method: 'GET',
    path: '/api/v1/me/tenants',
    group: 'Authentication & Context',
    summary: 'List available tenant contexts for user',
    description: 'Returns tenant organizations accessible to the active bearer token.',
    requiredRole: 'Any Authenticated User',
  },
  {
    method: 'GET',
    path: '/api/v1/me/sites',
    group: 'Authentication & Context',
    summary: 'List authorized sites within active tenant',
    description: 'Returns facility sites filtered by the user site_scopes claims.',
    requiredRole: 'Any Authenticated User',
  },
  {
    method: 'POST',
    path: '/api/v1/auth/logout',
    group: 'Authentication & Context',
    summary: 'Revoke active OIDC session token',
    description: 'Blacklists session token and cleans client credentials.',
    requiredRole: 'Any Authenticated User',
  },
  {
    method: 'POST',
    path: '/api/v1/auth/refresh',
    group: 'Authentication & Context',
    summary: 'Refresh access token via refresh grant',
    description: 'Returns newly minted RS256 JWT access token.',
    requiredRole: 'Any Authenticated User',
  },

  // Tenants & Sites
  {
    method: 'GET',
    path: '/api/v1/tenants',
    group: 'Tenants & Sites',
    summary: 'List all managed tenants (Control Plane)',
    description: 'Control plane registry list of all provisioning and active tenant databases.',
    requiredRole: 'PLATFORM_SUPER_ADMIN',
  },
  {
    method: 'GET',
    path: '/api/v1/tenants/{tenantId}',
    group: 'Tenants & Sites',
    summary: 'Get tenant details & health status',
    description: 'Returns database health, migration version, and feature flags.',
    requiredRole: 'TENANT_ADMIN',
  },
  {
    method: 'POST',
    path: '/api/v1/tenants',
    group: 'Tenants & Sites',
    summary: 'Provision new tenant database & organization',
    description: 'Initiates idempotent tenant schema provisioning job.',
    requiredRole: 'PLATFORM_SUPER_ADMIN',
    sampleBody: {
      name: 'Pacific Aerospace Corp',
      code: 'PAC',
      tier: 'ENTERPRISE_PREMIUM',
      timezone: 'America/Los_Angeles',
      retentionDays: 365,
    },
  },
  {
    method: 'PATCH',
    path: '/api/v1/tenants/{tenantId}',
    group: 'Tenants & Sites',
    summary: 'Update tenant branding or retention policies',
    description: 'Modifies tenant configuration and security policies.',
    requiredRole: 'TENANT_ADMIN',
    sampleBody: {
      retentionDays: 730,
      kioskMode: true,
    },
  },
  {
    method: 'GET',
    path: '/api/v1/sites',
    group: 'Tenants & Sites',
    summary: 'List facility sites in active tenant',
    description: 'Returns all buildings, physical campuses, and visitor policies.',
    requiredRole: 'All Staff Roles',
  },
  {
    method: 'POST',
    path: '/api/v1/sites',
    group: 'Tenants & Sites',
    summary: 'Register new facility site',
    description: 'Creates new site with timezone, visitor policy, and approval settings.',
    requiredRole: 'TENANT_ADMIN',
    sampleBody: {
      name: 'Seattle Research Hub',
      code: 'SEA-01',
      timezone: 'America/Los_Angeles',
      address: '200 Lake Washington Blvd, Seattle, WA',
      requiresHostApproval: true,
      requiresSecurityApproval: true,
    },
  },
  {
    method: 'GET',
    path: '/api/v1/gates',
    group: 'Tenants & Sites',
    summary: 'List entry/exit gates for site',
    description: 'Returns gates, turnstiles, and attached hardware devices.',
    requiredRole: 'All Staff Roles',
  },
  {
    method: 'POST',
    path: '/api/v1/gates',
    group: 'Tenants & Sites',
    summary: 'Create gate or reception turnstile',
    description: 'Adds gate record with operating status and terminal assignment.',
    requiredRole: 'SITE_ADMIN',
    sampleBody: {
      siteId: 'site-sv-01',
      name: 'East Visitor Atrium',
      code: 'GT-SV-04',
      type: 'BIDIRECTIONAL',
    },
  },

  // Users & Authorization
  {
    method: 'GET',
    path: '/api/v1/users',
    group: 'Users & Authorization',
    summary: 'List enterprise staff and employee directory',
    description: 'Returns users, roles, department memberships, and site scopes.',
    requiredRole: 'TENANT_ADMIN',
  },
  {
    method: 'POST',
    path: '/api/v1/users',
    group: 'Users & Authorization',
    summary: 'Assign role or onboard new user',
    description: 'Invites user with role assignment and scope boundaries.',
    requiredRole: 'TENANT_ADMIN',
    sampleBody: {
      fullName: 'Liam O’Connor',
      email: 'liam.oconnor@acme-corp.com',
      role: 'SECURITY_GUARD',
      departmentId: 'dept-sec',
      siteScopes: ['site-sv-01'],
    },
  },
  {
    method: 'GET',
    path: '/api/v1/roles',
    group: 'Users & Authorization',
    summary: 'List system RBAC roles and permissions',
    description: 'Returns available security roles and assigned permission flags.',
    requiredRole: 'All Roles',
  },

  // Visitors & Visits
  {
    method: 'GET',
    path: '/api/v1/visitors',
    group: 'Visitors & Visits',
    summary: 'Search visitor master profiles',
    description: 'Returns visitor profiles with masked PII and consent metadata.',
    requiredRole: 'RECEPTIONIST, SECURITY_GUARD, HOST_EMPLOYEE',
  },
  {
    method: 'POST',
    path: '/api/v1/visitors',
    group: 'Visitors & Visits',
    summary: 'Register new visitor profile',
    description: 'Creates visitor profile with photo, masked government ID, and NDA consent.',
    requiredRole: 'RECEPTIONIST, HOST_EMPLOYEE',
    sampleBody: {
      fullName: 'Maya Lin',
      email: 'maya.lin@lumina-designs.com',
      phoneNumber: '+1 (415) 555-0922',
      company: 'Lumina Designs',
      category: 'BUSINESS_GUEST',
      documentType: 'DRIVERS_LICENSE',
      documentNumber: 'DL-9821-4402',
    },
  },
  {
    method: 'GET',
    path: '/api/v1/visits',
    group: 'Visitors & Visits',
    summary: 'List and filter active, scheduled, or past visits',
    description: 'Returns visits filtered by state (CHECKED_IN, APPROVED, PENDING_APPROVAL, etc.).',
    requiredRole: 'All Staff Roles',
  },
  {
    method: 'POST',
    path: '/api/v1/visits',
    group: 'Visitors & Visits',
    summary: 'Create pre-registered visit or walk-in',
    description: 'Creates visit entity with pass token and approval routing.',
    requiredRole: 'HOST_EMPLOYEE, RECEPTIONIST',
    sampleBody: {
      visitorName: 'Arthur Dent',
      visitorEmail: 'arthur.dent@galaxy-infra.org',
      visitorCompany: 'Galaxy Infra',
      visitorCategory: 'BUSINESS_GUEST',
      scheduledStart: '2026-09-20T14:00:00Z',
      scheduledEnd: '2026-09-20T17:00:00Z',
      purpose: 'Datacenter fiber conduit inspection',
    },
  },
  {
    method: 'POST',
    path: '/api/v1/visits/{visitId}/check-in',
    group: 'Visitors & Visits',
    summary: 'Process visitor check-in transaction',
    description: 'Validates approval state, records entry timestamp, assigns badge number, logs audit event.',
    requiredRole: 'RECEPTIONIST, SECURITY_GUARD',
    sampleBody: {
      gateId: 'gate-sv-main',
      badgeNumber: 'ACME-2026-9041',
    },
  },
  {
    method: 'POST',
    path: '/api/v1/visits/{visitId}/check-out',
    group: 'Visitors & Visits',
    summary: 'Process visitor check-out transaction',
    description: 'Records departure timestamp, surrenders badge, decrements on-premises headcount.',
    requiredRole: 'RECEPTIONIST, SECURITY_GUARD',
    sampleBody: {
      gateId: 'gate-sv-main',
    },
  },

  // Invitations & Approvals
  {
    method: 'GET',
    path: '/api/v1/invitations',
    group: 'Invitations & Approvals',
    summary: 'List host-created invitations',
    description: 'Lists invitations with status tracking, QR tokens, and expiration times.',
    requiredRole: 'HOST_EMPLOYEE, RECEPTIONIST',
  },
  {
    method: 'POST',
    path: '/api/v1/invitations/{invitationId}/cancel',
    group: 'Invitations & Approvals',
    summary: 'Cancel pending or scheduled invitation',
    description: 'Revokes digital QR pass token and notifies guest.',
    requiredRole: 'HOST_EMPLOYEE, TENANT_ADMIN',
  },
  {
    method: 'GET',
    path: '/api/v1/approvals',
    group: 'Invitations & Approvals',
    summary: 'List visits pending host or security approval',
    description: 'Returns approval queue with purpose, guest company, and risk tags.',
    requiredRole: 'DEPARTMENT_APPROVER, TENANT_SECURITY_ADMIN, HOST_EMPLOYEE',
  },
  {
    method: 'POST',
    path: '/api/v1/approvals/{approvalId}/approve',
    group: 'Invitations & Approvals',
    summary: 'Grant visit approval',
    description: 'Advances visit state toward APPROVED with approver audit trail.',
    requiredRole: 'HOST_EMPLOYEE, DEPARTMENT_APPROVER, TENANT_SECURITY_ADMIN',
  },
  {
    method: 'POST',
    path: '/api/v1/approvals/{approvalId}/reject',
    group: 'Invitations & Approvals',
    summary: 'Reject visit with mandatory reason',
    description: 'Transitions visit to REJECTED with recorded justification.',
    requiredRole: 'HOST_EMPLOYEE, DEPARTMENT_APPROVER, TENANT_SECURITY_ADMIN',
    sampleBody: {
      reason: 'Missing vendor insurance certificate for rooftop work',
    },
  },

  // Badges & Devices
  {
    method: 'GET',
    path: '/api/v1/badge-templates',
    group: 'Badges & Devices',
    summary: 'List badge layout templates',
    description: 'Returns CR80 card and adhesive badge templates.',
    requiredRole: 'RECEPTIONIST, TENANT_ADMIN',
  },
  {
    method: 'POST',
    path: '/api/v1/badges/{badgeId}/print',
    group: 'Badges & Devices',
    summary: 'Submit badge print job to thermal printer',
    description: 'Dispatches job with mandatory Idempotency-Key header.',
    requiredRole: 'RECEPTIONIST, SECURITY_GUARD',
    sampleBody: {
      printerId: 'dev-printer-01',
      idempotencyKey: 'idmp-print-88192a',
      isReprint: false,
    },
  },
  {
    method: 'GET',
    path: '/api/v1/print-jobs',
    group: 'Badges & Devices',
    summary: 'Monitor thermal badge print queue',
    description: 'Returns print status, retry counts, and completion timestamps.',
    requiredRole: 'RECEPTIONIST, DEVICE_EDGE_ADMIN',
  },
  {
    method: 'GET',
    path: '/api/v1/devices',
    group: 'Badges & Devices',
    summary: 'List registered gate terminals, kiosks & printers',
    description: 'Returns hardware inventory, IP addresses, firmware, and heartbeat status.',
    requiredRole: 'DEVICE_EDGE_ADMIN, SITE_ADMIN',
  },
  {
    method: 'GET',
    path: '/api/v1/devices/{deviceId}/health',
    group: 'Badges & Devices',
    summary: 'Query hardware diagnostics & health probe',
    description: 'Returns live connectivity, paper roll status, and sensor alerts.',
    requiredRole: 'DEVICE_EDGE_ADMIN',
  },

  // Audit & Operations
  {
    method: 'GET',
    path: '/api/v1/audit-events',
    group: 'Audit & Operations',
    summary: 'Query immutable security & access audit trail',
    description: 'Forensic event log with correlation IDs, actors, and state deltas.',
    requiredRole: 'COMPLIANCE_AUDITOR, TENANT_SECURITY_ADMIN',
  },
  {
    method: 'GET',
    path: '/api/v1/reports/currently-inside',
    group: 'Audit & Operations',
    summary: 'Get real-time count & roster of visitors inside facility',
    description: 'Live physical security headcount with muster points and zones.',
    requiredRole: 'All Staff Roles',
  },
  {
    method: 'GET',
    path: '/api/v1/reports/visitors',
    group: 'Audit & Operations',
    summary: 'Historical visitor volume and overstay analytics',
    description: 'Daily peak entry distribution, category breakdown, duration metrics.',
    requiredRole: 'SITE_ADMIN, TENANT_ADMIN',
  },
  {
    method: 'GET',
    path: '/api/v1/operations/health',
    group: 'Audit & Operations',
    summary: 'System liveness, database pool, and edge status',
    description: 'Returns 200 OK with subsystem latency and queue depth metrics.',
    requiredRole: 'Public Health Probe',
  },
  {
    method: 'GET',
    path: '/api/v1/operations/edge-sync',
    group: 'Audit & Operations',
    summary: 'Edge synchronization queue status & reconciliation metrics',
    description: 'Reports pending offline event uploads and sync lag.',
    requiredRole: 'DEVICE_EDGE_ADMIN, SITE_ADMIN',
  },
];

export interface ApiResponse<T = unknown> {
  statusCode: number;
  statusText: string;
  durationMs: number;
  correlationId: string;
  headers: Record<string, string>;
  data: T;
  error?: {
    code: string;
    message: string;
    correlationId: string;
    details: Array<{ field?: string; message: string }>;
  };
}

export function executeMockApiCall(
  endpoint: ApiEndpointDef,
  customBody?: Record<string, unknown>
): Promise<ApiResponse> {
  return new Promise((resolve) => {
    const startTime = performance.now();
    const correlationId = `corr-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const state = storageService.getState();
    const actor = storageService.getActiveUser();

    // Standard headers
    const headers: Record<string, string> = {
      'content-type': 'application/json; charset=utf-8',
      'x-correlation-id': correlationId,
      'x-tenant-id': state.activeTenantId,
      'x-ratelimit-remaining': '998',
      'cache-control': 'no-store, max-age=0',
    };

    setTimeout(() => {
      const elapsed = Math.round(performance.now() - startTime);

      // Route simulation
      if (endpoint.path === '/api/v1/me') {
        resolve({
          statusCode: 200,
          statusText: 'OK',
          durationMs: elapsed,
          correlationId,
          headers,
          data: {
            user: actor,
            activeTenant: storageService.getActiveTenant(),
            activeSite: storageService.getActiveSite(),
            activeGate: storageService.getActiveGate(),
            claims: {
              iss: 'https://auth.acme-enterprise.com/oauth/v2',
              sub: actor.id,
              aud: 'vms-platform-core',
              role: actor.role,
              siteScopes: actor.siteScopes,
              gateScopes: actor.gateScopes,
              mfaVerified: actor.mfaEnabled,
            },
          },
        });
        return;
      }

      if (endpoint.path === '/api/v1/operations/health') {
        resolve({
          statusCode: 200,
          statusText: 'OK',
          durationMs: elapsed,
          correlationId,
          headers,
          data: {
            status: 'UP',
            version: '2026.09.v14',
            uptimeSeconds: 84320,
            databasePool: {
              activeConnections: 12,
              idleConnections: 38,
              health: 'HEALTHY',
            },
            edgeSync: {
              status: state.isEdgeOnline ? 'ONLINE' : 'OFFLINE_BUFFERING',
              pendingQueueDepth: state.edgeSyncEvents.filter((e) => e.status === 'PENDING_UPLOAD').length,
            },
            printSpooler: {
              queuedJobs: state.printJobs.filter((j) => j.status === 'QUEUED').length,
            },
          },
        });
        return;
      }

      if (endpoint.path === '/api/v1/reports/currently-inside') {
        const currentlyInside = state.visits.filter((v) => v.state === 'CHECKED_IN');
        resolve({
          statusCode: 200,
          statusText: 'OK',
          durationMs: elapsed,
          correlationId,
          headers,
          data: {
            siteId: state.activeSiteId,
            siteName: storageService.getActiveSite().name,
            totalCheckedIn: currentlyInside.length,
            visitors: currentlyInside.map((v) => ({
              visitId: v.id,
              visitorName: v.visitorName,
              company: v.visitorCompany,
              category: v.visitorCategory,
              hostName: v.hostName,
              department: v.departmentName,
              actualCheckInUtc: v.actualCheckIn,
              badgeNumber: v.badgeNumber,
              assignedZone: v.assignedZone,
              musterPoint: v.musterPoint,
            })),
          },
        });
        return;
      }

      if (endpoint.path === '/api/v1/visits') {
        if (endpoint.method === 'GET') {
          resolve({
            statusCode: 200,
            statusText: 'OK',
            durationMs: elapsed,
            correlationId,
            headers,
            data: {
              totalCount: state.visits.length,
              items: state.visits,
            },
          });
          return;
        } else if (endpoint.method === 'POST') {
          const body = customBody || endpoint.sampleBody || {};
          const result = storageService.createInvitation({
            visitorName: (body.visitorName as string) || 'Authorized Guest',
            visitorEmail: (body.visitorEmail as string) || 'guest@example.com',
            visitorPhone: '+1 (555) 019-2831',
            visitorCompany: (body.visitorCompany as string) || 'Corporate Partner',
            visitorCategory: 'BUSINESS_GUEST',
            documentType: 'DRIVERS_LICENSE',
            documentNumber: 'DL-88219',
            hostUserId: actor.id,
            siteId: state.activeSiteId,
            gateId: state.activeGateId,
            purpose: (body.purpose as string) || 'Executive Meeting',
            scheduledStart: new Date().toISOString(),
            scheduledEnd: new Date(Date.now() + 14400000).toISOString(),
            requiresSecurityEscort: false,
          });

          resolve({
            statusCode: 201,
            statusText: 'Created',
            durationMs: elapsed,
            correlationId,
            headers,
            data: result.visit,
          });
          return;
        }
      }

      if (endpoint.path.includes('/check-in')) {
        const firstCheckedInCandidate = state.visits.find((v) => v.state === 'APPROVED' || v.state === 'ARRIVED');
        if (!firstCheckedInCandidate) {
          resolve({
            statusCode: 400,
            statusText: 'Bad Request',
            durationMs: elapsed,
            correlationId,
            headers,
            data: {},
            error: {
              code: 'VISIT_NOT_APPROVED',
              message: 'No pre-approved visits currently waiting for check-in at this gate.',
              correlationId,
              details: [{ field: 'state', message: 'Visit must be in APPROVED or ARRIVED state.' }],
            },
          });
          return;
        }

        const res = storageService.checkInVisit(firstCheckedInCandidate.id);
        resolve({
          statusCode: res.success ? 200 : 400,
          statusText: res.success ? 'OK' : 'Bad Request',
          durationMs: elapsed,
          correlationId,
          headers,
          data: res.visit || {},
          error: res.success
            ? undefined
            : {
                code: 'CHECK_IN_FAILED',
                message: res.message,
                correlationId,
                details: [],
              },
        });
        return;
      }

      if (endpoint.path.includes('/check-out')) {
        const checkedInVisitor = state.visits.find((v) => v.state === 'CHECKED_IN');
        if (!checkedInVisitor) {
          resolve({
            statusCode: 400,
            statusText: 'Bad Request',
            durationMs: elapsed,
            correlationId,
            headers,
            data: {},
            error: {
              code: 'NO_ACTIVE_VISIT_FOUND',
              message: 'There are no active checked-in visitors eligible for checkout.',
              correlationId,
              details: [],
            },
          });
          return;
        }

        const res = storageService.checkOutVisit(checkedInVisitor.id);
        resolve({
          statusCode: res.success ? 200 : 400,
          statusText: res.success ? 'OK' : 'Bad Request',
          durationMs: elapsed,
          correlationId,
          headers,
          data: res.visit || {},
        });
        return;
      }

      // Default generic response for other catalog endpoints
      resolve({
        statusCode: 200,
        statusText: 'OK',
        durationMs: elapsed,
        correlationId,
        headers,
        data: {
          endpoint: `${endpoint.method} ${endpoint.path}`,
          status: 'SUCCESS',
          timestampUtc: new Date().toISOString(),
          context: {
            tenant: state.activeTenantId,
            site: state.activeSiteId,
            actor: actor.name,
            role: actor.role,
          },
          summary: endpoint.summary,
        },
      });
    }, 120);
  });
}
