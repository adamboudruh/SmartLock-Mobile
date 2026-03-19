import * as Crypto from 'expo-crypto';
const UID_SALT = 'smartlock-uid-v1'; // must match ESP32

export async function hashUID(uid: string): Promise<string> {
  const saltedUid = UID_SALT + uid;

  const hashHex = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    saltedUid
  );

  return hashHex.toUpperCase();
}