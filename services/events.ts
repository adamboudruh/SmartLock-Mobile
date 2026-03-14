import api from './api';

export interface Event {
  eventId:   number;
  eventType: string;
  keyName:   string | null;
  deviceId:  string | null;
  createdAt: string;
}

export const getEvents = () => api.get<{ data: Event[] }>('/events');
export const clearEvents = () => api.delete('/events');