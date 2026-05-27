import { apiFetch } from './apiFetch';
import type { PaginatedResponse } from '@/types';
import type { Event } from '@/types/event';
import type { EventFormData } from '@/validators';

export async function getEvents(): Promise<Event[]> {
  const response = await apiFetch<PaginatedResponse<Event>>('/events', { params: { per_page: 50 } });
  return response.data;
}

export async function getUpcomingEvents(): Promise<Event[]> {
  const events = await getEvents();
  const now = Date.now();
  return events
    .filter((event) => event.is_active && new Date(event.starts_at).getTime() >= now)
    .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime())
    .slice(0, 6);
}

export async function getEvent(slug: string): Promise<Event> {
  return apiFetch<Event>(`/events/${slug}`);
}

export async function createEvent(data: EventFormData | FormData): Promise<Event> {
  return apiFetch<Event>('/admin/events', { method: 'POST', body: data });
}

export async function updateEvent(
  id: number,
  data: EventFormData | FormData,
): Promise<Event> {
  return apiFetch<Event>(`/admin/events/${id}`, { method: 'PUT', body: data });
}

export async function deleteEvent(id: number): Promise<void> {
  return apiFetch<void>(`/admin/events/${id}`, { method: 'DELETE' });
}

export async function getAdminEvents(): Promise<PaginatedResponse<Event>> {
  return apiFetch<PaginatedResponse<Event>>('/admin/events');
}
