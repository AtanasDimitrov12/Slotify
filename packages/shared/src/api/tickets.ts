import { apiFetch } from './http';

export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TicketType = 'bugfix' | 'feature' | 'request' | 'question';
export type TicketStage = string;

export interface Stage {
  _id: string;
  name: string;
  label: string;
  color: string;
  isCollapsed: boolean;
  order: number;
  tenantId: string;
}

export const getStages = (): Promise<Stage[]> => {
  return apiFetch<Stage[]>('/ticket-stages');
};

export const createStage = (dto: Partial<Stage>): Promise<Stage> => {
  return apiFetch<Stage>('/ticket-stages', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
};

export const updateStage = (id: string, dto: Partial<Stage>): Promise<Stage> => {
  return apiFetch<Stage>(`/ticket-stages/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(dto),
  });
};

export const deleteStage = (id: string): Promise<void> => {
  return apiFetch<void>(`/ticket-stages/${id}`, {
    method: 'DELETE',
  });
};

export const updateStagesOrder = (stageOrders: { id: string; order: number }[]): Promise<void> => {
  return apiFetch<void>('/ticket-stages/order', {
    method: 'PUT',
    body: JSON.stringify(stageOrders),
  });
};
export type TicketBadge =
  | 'info_needed'
  | 'blocked'
  | 'requested_changes'
  | 'hold'
  | 'has_pr'
  | 'awaiting_feedback';

export interface Ticket {
  _id: string;
  code: string;
  title: string;
  userStories: string;
  description: string;
  acceptanceCriteria: string;
  nonTechnicalAcceptanceCriteria: string;
  priority: TicketPriority;
  type: TicketType;
  stage: TicketStage;
  badges: TicketBadge[];
  startedAt?: string;
  completedAt?: string;
  requestedBy: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTicketDto {
  title: string;
  userStories: string;
  description: string;
  acceptanceCriteria: string;
  nonTechnicalAcceptanceCriteria: string;
  priority: TicketPriority;
  type: TicketType;
  stage?: TicketStage;
  badges?: TicketBadge[];
}

export interface UpdateTicketDto extends Partial<CreateTicketDto> {
  badges?: TicketBadge[];
  stage?: TicketStage;
}

export const getTickets = (filters?: { stage?: TicketStage; search?: string }): Promise<Ticket[]> => {
  const params = new URLSearchParams();
  if (filters?.stage) params.append('stage', filters.stage);
  if (filters?.search) params.append('search', filters.search);
  return apiFetch<Ticket[]>(`/tickets?${params.toString()}`);
};

export const createTicket = (dto: CreateTicketDto): Promise<Ticket> => {
  return apiFetch<Ticket>('/tickets', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
};

export const updateTicket = (id: string, dto: UpdateTicketDto): Promise<Ticket> => {
  return apiFetch<Ticket>(`/tickets/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(dto),
  });
};

export const startTicket = (id: string): Promise<Ticket> => {
  return apiFetch<Ticket>(`/tickets/${id}/start`, {
    method: 'POST',
  });
};

export const finishTicket = (id: string): Promise<Ticket> => {
  return apiFetch<Ticket>(`/tickets/${id}/finish`, {
    method: 'POST',
  });
};

export const deleteTicket = (id: string): Promise<void> => {
  return apiFetch<void>(`/tickets/${id}`, {
    method: 'DELETE',
  });
};
