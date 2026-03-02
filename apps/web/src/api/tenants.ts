export type Tenant = {
  _id: string;
  name: string;
  slug: string;
  status: 'active' | 'inactive' | 'suspended';
  isPublished: boolean;
  timezone: string;
  ownerEmail?: string;
  plan?: string;
  createdAt: string;
  updatedAt: string;
};
