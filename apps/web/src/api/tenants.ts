// src/api/slotify.ts
// FE client for Slotify API (NestJS)
// Covers: tenants, tenant-details, tenant-accounts

export type TenantStatus = 'active' | 'inactive' | 'suspended'
export type TenantAccountRole = 'owner' | 'manager' | 'staff'

// -----------------------------
// TENANT
// -----------------------------
export type Tenant = {
  _id: string
  name: string
  slug: string
  status: TenantStatus
  isPublished: boolean
  timezone: string
  ownerEmail?: string
  plan?: string
  deletedAt?: string
  createdAt?: string
  updatedAt?: string
}

export type CreateTenantPayload = {
  name: string
  ownerEmail?: string
  timezone?: string
  plan?: string
}

export type UpdateTenantPayload = Partial<Pick<Tenant, 'name' | 'ownerEmail' | 'timezone' | 'plan'>>

export async function listTenants(): Promise<Tenant[]> {
  const res = await fetch('/api/tenants')
  if (!res.ok) throw new Error('Failed to load tenants')
  return res.json()
}

export async function getTenant(id: string): Promise<Tenant> {
  const res = await fetch(`/api/tenants/${id}`)
  if (!res.ok) throw new Error('Failed to load tenant')
  return res.json()
}

export async function createTenant(payload: CreateTenantPayload): Promise<Tenant> {
  const res = await fetch('/api/tenants', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error('Failed to create tenant')
  return res.json()
}

export async function updateTenant(id: string, payload: UpdateTenantPayload): Promise<Tenant> {
  const res = await fetch(`/api/tenants/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error('Failed to update tenant')
  return res.json()
}

export async function deleteTenant(id: string): Promise<{ deleted: true; id: string }> {
  const res = await fetch(`/api/tenants/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete tenant')
  return res.json()
}

// -----------------------------
// TENANT DETAILS
// -----------------------------

export type OpeningHoursDay = {
  // 0..6 (Sun..Sat) OR use 'mon'...'sun' if you prefer
  day: number
  open: string // "09:00"
  close: string // "18:00"
  closed?: boolean
}

export type TenantAddress = {
  street?: string
  number?: string
  city?: string
  zip?: string
  country?: string
}

export type TenantDetails = {
  _id: string
  tenantId: string

  // Contact / identity
  contactPerson?: string
  contactEmail?: string
  contactPhone?: string

  // Location
  address?: TenantAddress

  // Public profile (optional but useful)
  description?: string
  websiteUrl?: string
  instagramUrl?: string

  // Hours
  openingHours?: OpeningHoursDay[]

  createdAt?: string
  updatedAt?: string
}

export type CreateTenantDetailsPayload = {
  tenantId: string
  contactPerson?: string
  contactEmail?: string
  contactPhone?: string
  address?: TenantAddress
  description?: string
  websiteUrl?: string
  instagramUrl?: string
  openingHours?: OpeningHoursDay[]
}

export type UpdateTenantDetailsPayload = Partial<Omit<CreateTenantDetailsPayload, 'tenantId'>> & {
  tenantId?: never // prevent accidental change
}

export async function getTenantDetailsByTenantId(tenantId: string): Promise<TenantDetails> {
  const res = await fetch(`/api/tenant-details/${tenantId}`)
  if (!res.ok) throw new Error('Failed to load tenant details')
  return res.json()
}

export async function createTenantDetails(payload: CreateTenantDetailsPayload): Promise<TenantDetails> {
  const res = await fetch('/api/tenant-details', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error('Failed to create tenant details')
  return res.json()
}

export async function updateTenantDetailsByTenantId(
  tenantId: string,
  payload: UpdateTenantDetailsPayload,
): Promise<TenantDetails> {
  const res = await fetch(`/api/tenant-details/${tenantId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error('Failed to update tenant details')
  return res.json()
}

// Upsert is very convenient for FE profile screens
export async function upsertTenantDetailsByTenantId(
  tenantId: string,
  payload: UpdateTenantDetailsPayload,
): Promise<TenantDetails> {
  const res = await fetch(`/api/tenant-details/${tenantId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error('Failed to upsert tenant details')
  return res.json()
}

// -----------------------------
// TENANT ACCOUNTS
// -----------------------------

export type TenantAccount = {
  _id: string
  tenantId: string
  name: string
  email: string

  // never returned as raw password; backend stores hashed password
  isMain: boolean
  isActive: boolean
  role: TenantAccountRole

  lastLoginAt?: string
  emailVerified?: boolean

  createdAt?: string
  updatedAt?: string
}

export type CreateTenantAccountPayload = {
  tenantId: string
  name: string
  email: string
  password: string
  isMain?: boolean
  role?: TenantAccountRole
}

export type UpdateTenantAccountPayload = Partial<{
  name: string
  password: string
  isMain: boolean
  isActive: boolean
  role: TenantAccountRole
  emailVerified: boolean
}>

export async function listTenantAccounts(tenantId: string): Promise<TenantAccount[]> {
  const res = await fetch(`/api/tenant-accounts/tenant/${tenantId}`)
  if (!res.ok) throw new Error('Failed to load tenant accounts')
  return res.json()
}

export async function createTenantAccount(payload: CreateTenantAccountPayload): Promise<TenantAccount> {
  const res = await fetch('/api/tenant-accounts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error('Failed to create tenant account')
  return res.json()
}

export async function updateTenantAccount(id: string, payload: UpdateTenantAccountPayload): Promise<TenantAccount> {
  const res = await fetch(`/api/tenant-accounts/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error('Failed to update tenant account')
  return res.json()
}

// (Optional) if you later add DELETE endpoint
export async function deleteTenantAccount(id: string): Promise<{ deleted: true; id: string }> {
  const res = await fetch(`/api/tenant-accounts/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete tenant account')
  return res.json()
}