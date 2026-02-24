export type Tenant = {
  _id: string
  name: string
  city?: string
  address?: string
  createdAt?: string
  updatedAt?: string
}

export async function listTenants(): Promise<Tenant[]> {
  const res = await fetch('/api/tenants')
  if (!res.ok) throw new Error('Failed to load tenants')
  return res.json()
}

export async function createTenant(payload: Pick<Tenant, 'name' | 'city' | 'address'>) {
  const res = await fetch('/api/tenants', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error('Failed to create tenant')
  return res.json()
}

export async function updateTenant(id: string, payload: Partial<Pick<Tenant, 'name' | 'city' | 'address'>>) {
  const res = await fetch(`/api/tenants/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error('Failed to update tenant')
  return res.json()
}

export async function deleteTenant(id: string) {
  const res = await fetch(`/api/tenants/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete tenant')
  return res.json()
}