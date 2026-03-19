import api from './api';

export interface Event {
  eventId:   number;
  eventType: string;
  keyId:     string | null;
  keyName:   string | null;
  deviceId:  string | null;
  createdAt: string;
}

export const getEvents = () => api.get<Event[]>('/events');
export const clearEvents = () => api.delete('/events');