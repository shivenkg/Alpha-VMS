/**
 * Enterprise Visitor Management System (VMS) Domain Types
 * Based on Master Specification Blueprint (Phases 0-6)
 */

export type NavViewId =
  | 'dashboard'
  | 'reception'
  | 'walkin'
  | 'visitors'
  | 'approvals'
  | 'invitations'
  | 'badges'
  | 'emergency'
  | 'devices'
  | 'edge'
  | 'reports'
  | 'audit'
  | 'iam'
  | 'tenants'
  | 'blueprint'
  | 'api_explorer'
  | 'uat_tests'
  | 'pre_register'
  | 'admin_hub'
  | 'customization'
  | 'user_management'
  | 'tenant_provisioning';

export type UserRole =
  | 'PLATFORM_SUPER_ADMIN'
  | 'TENANT_ADMIN'
  | 'TENANT_SECURITY_ADMIN'
  | 'SITE_ADMIN'
  | 'GATE_SUPERVISOR'
  | 'SECURITY_GUARD'
  | 'RECEPTIONIST'
  | 'HOST_EMPLOYEE'
  | 'DEPARTMENT_APPROVER'
  | 'COMPLIANCE_AUDITOR'
  | 'DEVICE_EDGE_ADMIN';

export interface Tenant {
  id: string;
  name: string;
  code: string;
  tier: 'ENTERPRISE_STANDARD' | 'ENTERPRISE_PREMIUM' | 'MISSION_CRITICAL';
  status: 'ACTIVE' | 'SUSPENDED' | 'PROVISIONING' | 'ARCHIVED';
  timezone: string;
  locale: string;
  databaseRef: string;
  databaseHealth: 'HEALTHY' | 'WARNING' | 'ERROR';
  migrationVersion: string;
  retentionDays: number;
  features: {
    kioskMode: boolean;
    biometricVerification: boolean;
    whatsappNotifications: boolean;
    edgeOfflineEnabled: boolean;
    multiLevelApproval: boolean;
  };
  branding: {
    primaryColor: string;
    logoText: string;
  };
  createdAt: string;
}

export interface Site {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  timezone: string;
  address: string;
  status: 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE';
  visitorPolicy: string;
  requiresHostApproval: boolean;
  requiresSecurityApproval: boolean;
}

export interface BuildingZone {
  id: string;
  siteId: string;
  name: string;
  code: string;
  securityLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'RESTRICTED';
  musterPoint: string;
  maxCapacity: number;
}

export interface Gate {
  id: string;
  siteId: string;
  name: string;
  code: string;
  type: 'ENTRY_ONLY' | 'EXIT_ONLY' | 'BIDIRECTIONAL';
  operatingStatus: 'OPEN' | 'RESTRICTED' | 'EMERGENCY_LOCKDOWN' | 'OFFLINE';
  assignedPrinterId?: string;
  assignedTerminalId?: string;
}

export interface Department {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  leadApproverId: string;
  leadApproverName: string;
}

export interface HostNotificationSettings {
  enableSms: boolean;
  smsPhoneNumber?: string;
  enableEmail: boolean;
  alertEmail?: string;
  enableSlack: boolean;
  slackWebhookUrl?: string;
  slackChannel?: string;
  alertOnArrival: boolean;
  alertOnCheckOut: boolean;
  alertOnPendingApproval: boolean;
}

export interface AppUser {
  id: string;
  tenantId: string;
  name: string;
  loginId: string;
  email: string;
  password?: string;
  phoneNumber?: string;
  avatarUrl?: string;
  role: UserRole;
  departmentId: string;
  departmentName: string;
  siteScopes: string[]; // siteIds or ['*']
  gateScopes: string[]; // gateIds or ['*']
  mfaEnabled: boolean;
  status: 'ACTIVE' | 'INACTIVE';
  lastLoginAt: string;
  notificationSettings?: HostNotificationSettings;
}

export type VisitorCategory =
  | 'BUSINESS_GUEST'
  | 'CONTRACTOR'
  | 'VENDOR'
  | 'INTERVIEW_CANDIDATE'
  | 'VIP_EXECUTIVE'
  | 'REGULATORY_AUDITOR'
  | 'FACILITY_MAINTENANCE'
  | 'DELIVERY_DISPATCH';

export interface VisitorProfile {
  id: string;
  tenantId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  company: string;
  category: VisitorCategory;
  documentType: 'PASSPORT' | 'DRIVERS_LICENSE' | 'NATIONAL_ID' | 'GOVERNMENT_BADGE';
  maskedDocumentNumber: string;
  consentSigned: boolean;
  consentSignedAt?: string;
  ndaSigned: boolean;
  photoUrl?: string;
  watchlistStatus: 'CLEAN' | 'NEEDS_VERIFICATION' | 'FLAGGED';
  totalVisits: number;
  lastVisitAt?: string;
  createdAt: string;
}

export type VisitLifecycleState =
  | 'DRAFT'
  | 'INVITED'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'ARRIVED'
  | 'CHECKED_IN'
  | 'CHECKED_OUT'
  | 'CLOSED'
  | 'EXPIRED'
  | 'NO_SHOW'
  | 'DENIED'
  | 'OVERRIDDEN'
  | 'SYNC_PENDING';

export interface Visit {
  id: string;
  tenantId: string;
  siteId: string;
  siteName: string;
  gateId: string;
  gateName: string;
  visitorId: string;
  visitorName: string;
  visitorCompany: string;
  visitorCategory: VisitorCategory;
  hostUserId: string;
  hostName: string;
  departmentId: string;
  departmentName: string;
  purpose: string;
  scheduledStart: string;
  scheduledEnd: string;
  actualCheckIn?: string;
  actualCheckOut?: string;
  state: VisitLifecycleState;
  stateReason?: string;
  passToken: string;
  passTokenExpiresAt: string;
  badgeId?: string;
  badgeNumber?: string;
  approvalStatus: {
    hostApproved?: boolean;
    hostApprovedAt?: string;
    departmentApproved?: boolean;
    departmentApprovedAt?: string;
    securityApproved?: boolean;
    securityApprovedAt?: string;
    rejectionReason?: string;
  };
  entryGateId?: string;
  exitGateId?: string;
  checkedInBy?: string;
  checkedOutBy?: string;
  photoUrl?: string;
  assignedZone?: string;
  musterPoint?: string;
  isAccountedForInEmergency?: boolean;
  origin?: 'WALK_IN' | 'STAFF_INVITATION' | 'PUBLIC_HOST_PORTAL' | 'API_IMPORT';
  specialAccessNotes?: string;
  createdAt: string;
}

export interface UserPreferences {
  autoPrintBadgesOnCheckIn: boolean;
  preferredPrinterId?: string;
  soundAlertsEnabled: boolean;
  thermalLabelFormat: 'ZEBRA_4X3' | 'BROTHER_DK' | 'CR80_CARD';
  promptBeforePrint: boolean;
}

export interface BadgeTemplate {
  id: string;
  tenantId: string;
  name: string;
  type: 'CR80_CARD' | 'ADHESIVE_LABEL' | 'CONFERENCE_PASS';
  widthMm: number;
  heightMm: number;
  showPhoto: boolean;
  showQrCode: boolean;
  showHost: boolean;
  showCategoryColor: boolean;
  headerBackground: string;
  instructions: string;
}

export interface BadgePrintJob {
  id: string;
  tenantId: string;
  siteId: string;
  visitId: string;
  visitorName: string;
  badgeNumber: string;
  printerId: string;
  printerName: string;
  idempotencyKey: string;
  status: 'QUEUED' | 'PRINTING' | 'COMPLETED' | 'FAILED' | 'RETRYING';
  retryCount: number;
  createdAt: string;
  completedAt?: string;
  errorMessage?: string;
  isReprint?: boolean;
  reprintReason?: string;
}

export interface HardwareDevice {
  id: string;
  tenantId: string;
  siteId: string;
  gateId: string;
  name: string;
  identifier: string;
  type: 'RECEPTION_KIOSK' | 'SECURITY_TERMINAL' | 'QR_SCANNER' | 'BADGE_PRINTER' | 'EDGE_CONTROLLER';
  model: string;
  ipAddress: string;
  status: 'ONLINE' | 'WARNING' | 'OFFLINE';
  lastHeartbeat: string;
  firmwareVersion: string;
  batteryPercentage?: number;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  tenantId: string;
  siteId?: string;
  gateId?: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  eventType: string;
  action: string;
  entityType: 'VISIT' | 'VISITOR' | 'BADGE' | 'TENANT' | 'SECURITY' | 'DEVICE' | 'EDGE';
  entityId: string;
  previousState?: string;
  newState?: string;
  details: string;
  correlationId: string;
  ipAddress: string;
  status: 'SUCCESS' | 'DENIED' | 'FAILURE';
}

export interface EdgeSyncEvent {
  id: string;
  eventGuid: string;
  tenantId: string;
  siteId: string;
  gateId: string;
  eventType: 'OFFLINE_CHECK_IN' | 'OFFLINE_CHECK_OUT' | 'OFFLINE_REGISTRATION';
  payload: Record<string, unknown>;
  capturedAtUtc: string;
  syncedAtUtc?: string;
  status: 'PENDING_UPLOAD' | 'SYNCED' | 'CONFLICT' | 'RETRY';
  conflictResolution?: string;
  hash: string;
}

export interface UATTestCase {
  id: number;
  code: string;
  name: string;
  category: 'OIDC' | 'ACCESS_CONTROL' | 'PROVISIONING' | 'VISIT_LIFECYCLE' | 'BADGE_PRINT' | 'EDGE_SYNC' | 'AUDIT_PRIVACY';
  preconditions: string;
  testSteps: string[];
  expectedResult: string;
  actualResult?: string;
  status: 'UNTESTED' | 'RUNNING' | 'PASS' | 'FAIL';
  executionTimeMs?: number;
  evidence?: string;
}

export interface GoogleSheetConfig {
  enabled: boolean;
  spreadsheetId: string;
  spreadsheetUrl: string;
  sheetName: string;
  syncMode: 'REALTIME_CHECKIN' | 'TWO_WAY_PRE_REG' | 'BATCH_AUDIT_LOGS';
  autoSyncOnCheckIn: boolean;
  autoSyncOnCheckOut: boolean;
  serviceAccountEmail?: string;
  webhookAppsScriptUrl?: string;
  lastSyncedAt?: string;
  totalRowsSynced?: number;
  syncStatus: 'CONNECTED' | 'DISCONNECTED' | 'SYNCING' | 'ERROR';
  lastError?: string;
  fieldsToSync: {
    visitorName: boolean;
    company: boolean;
    hostName: boolean;
    department: boolean;
    checkInTime: boolean;
    checkOutTime: boolean;
    badgeNumber: boolean;
    state: boolean;
    securityClearance: boolean;
  };
}
