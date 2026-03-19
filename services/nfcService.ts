import NfcManager, { NfcTech } from 'react-native-nfc-manager';

// initialize the NFC manager
export async function initNfc(): Promise<boolean> {
  const supported = await NfcManager.isSupported();
  if (!supported) return false;
  await NfcManager.start();
  return true;
}

export async function isNfcSupported(): Promise<boolean> {
  return await NfcManager.isSupported();
}

export async function isNfcEnabled(): Promise<boolean> {
  return await NfcManager.isEnabled();
}

// scans a single NFC tag and returns the UID as a hex string
export async function scanNfcTag(): Promise<string> {
  try {
    await NfcManager.requestTechnology(NfcTech.NfcA);
    const tag = await NfcManager.getTag();
    if (!tag?.id) throw new Error('No tag ID found');

    const rawId = tag.id;

    // tag.id can be a number[] or a string depending on the device
    const uid = Array.isArray(rawId)
        ? rawId
            .map((b: number) => b.toString(16).padStart(2, '0'))
            .join('')
            .toUpperCase()
        : rawId.toUpperCase();

    return uid;
  } finally {
    await NfcManager.cancelTechnologyRequest();
  }
}