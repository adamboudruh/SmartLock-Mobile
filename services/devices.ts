import api from './api';

// defines current state of device that will be displayed on dashboard
export interface DeviceState {
  isLocked: boolean | null; // is door locked or not
  isAjar:   boolean | null; // is door open or closed
  online:   boolean;        // is device online or offline
}

export const getState = () => api.get<DeviceState>('/devices/state');
export const lockDoor = () => api.post('/devices/lock');
export const unlockDoor = () => api.post('/devices/unlock');