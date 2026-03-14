const UID_SALT = 'smartlock-uid-v1'; // must match ESP32

export async function hashUID(uid: string): Promise<string> {
  const saltedUid = UID_SALT + uid;

  // encode the string to a byte array
  const msgBuffer = new TextEncoder().encode(saltedUid);

  // hash it using the built-in Web Crypto API
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);

  // convert the resulting ArrayBuffer to a hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();

  return hashHex;
}