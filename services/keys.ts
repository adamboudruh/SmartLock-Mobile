import api from './api';

// defines key object returned by backend server
export interface Key {
  keyId:     string;
  name:      string; // name of the key
  tagUid:    string; // unique identifier for the key
  createdAt: string; // timestamp when the key was created
}

export const getKeys = () => api.get<Key[]>('/keys');
export const registerKey = (name: string, tagUid: string) => api.post('/keys/register', { name, tagUid });
export const deleteKey = (id: string) => api.delete(`/keys/${id}`);