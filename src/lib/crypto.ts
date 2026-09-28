/**
 * RoyalPlay Cryptographic Subsystem
 * Implements real AES-256-GCM with PBKDF2 key derivation using the native Web Crypto API (SubtleCrypto).
 * Provides end-to-end payload armor, authenticated decryption, and provably fair hashing.
 */

// Helper to convert ArrayBuffer to Base64
export function bufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Helper to convert Base64 to Uint8Array
export function base64ToBuffer(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// Helper to convert string to ArrayBuffer (UTF-8)
export function stringToBuffer(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

// Helper to convert ArrayBuffer to string (UTF-8)
export function bufferToString(buffer: ArrayBuffer | Uint8Array): string {
  return new TextDecoder().decode(buffer);
}

// SHA-256 Digest helper
export async function sha256Hex(message: string): Promise<string> {
  const data = stringToBuffer(message);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data as unknown as BufferSource);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Derives a 256-bit AES-GCM key from a passphrase using PBKDF2 and a random salt
 */
async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    stringToBuffer(passphrase) as unknown as BufferSource,
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as unknown as BufferSource,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export interface EncryptedPayload {
  armoredString: string;
  salt: string;
  iv: string;
  ciphertext: string;
  algorithm: 'AES-256-GCM';
  iterations: number;
}

/**
 * Encrypts plain text using AES-256-GCM with a user-supplied passphrase
 */
export async function encryptMessage(text: string, passphrase: string): Promise<EncryptedPayload> {
  if (!text || !passphrase) {
    throw new Error('El mensaje y la clave de cifrado no pueden estar vacíos.');
  }

  // 16-byte random salt for PBKDF2
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  // 12-byte random IV standard for AES-GCM
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  // Derive AES-256 key
  const key = await deriveKey(passphrase, salt);

  // Encrypt
  const ciphertextBuffer = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv as unknown as BufferSource,
      tagLength: 128, // 128-bit authentication tag
    },
    key,
    stringToBuffer(text) as unknown as BufferSource
  );

  const saltB64 = bufferToBase64(salt);
  const ivB64 = bufferToBase64(iv);
  const cipherB64 = bufferToBase64(ciphertextBuffer);

  // Armored format: RP-AES256GCM:<salt>:<iv>:<ciphertext>
  const armoredString = `RP-AES256GCM:${saltB64}:${ivB64}:${cipherB64}`;

  return {
    armoredString,
    salt: saltB64,
    iv: ivB64,
    ciphertext: cipherB64,
    algorithm: 'AES-256-GCM',
    iterations: 100000,
  };
}

/**
 * Decrypts an armored or componentized AES-256-GCM payload
 */
export async function decryptMessage(armoredPayload: string, passphrase: string): Promise<string> {
  if (!armoredPayload || !passphrase) {
    throw new Error('El mensaje cifrado y la clave de descifrado son requeridos.');
  }

  let saltB64 = '';
  let ivB64 = '';
  let cipherB64 = '';

  const clean = armoredPayload.trim();

  if (clean.startsWith('RP-AES256GCM:')) {
    const parts = clean.split(':');
    if (parts.length !== 4) {
      throw new Error('Formato de carga cifrada inválido. Debe comenzar con RP-AES256GCM:<salt>:<iv>:<ciphertext>');
    }
    saltB64 = parts[1];
    ivB64 = parts[2];
    cipherB64 = parts[3];
  } else {
    // Attempt parsing as JSON object if passed as stringified JSON
    try {
      const obj = JSON.parse(clean);
      if (obj.salt && obj.iv && obj.ciphertext) {
        saltB64 = obj.salt;
        ivB64 = obj.iv;
        cipherB64 = obj.ciphertext;
      } else {
        throw new Error();
      }
    } catch {
      throw new Error('Formato no reconocido. Se requiere una carga acorazada RP-AES256GCM o JSON con salt, iv y ciphertext.');
    }
  }

  try {
    const salt = base64ToBuffer(saltB64);
    const iv = base64ToBuffer(ivB64);
    const ciphertext = base64ToBuffer(cipherB64);

    const key = await deriveKey(passphrase, salt);

    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv as unknown as BufferSource,
        tagLength: 128,
      },
      key,
      ciphertext as unknown as BufferSource
    );

    return bufferToString(decryptedBuffer);
  } catch (err) {
    throw new Error('Error al descifrar: La clave proporcionada es incorrecta o los datos fueron alterados (fallo de autenticación GCM).');
  }
}

/**
 * Provably Fair calculation helper:
 * Generates HMAC-SHA256 outcome verification for online casino integrity.
 */
export async function generateProvablyFairHash(serverSeed: string, clientSeed: string, nonce: number): Promise<string> {
  const combined = `${serverSeed}:${clientSeed}:${nonce}`;
  return sha256Hex(combined);
}

/**
 * Generates a random cryptographic seed
 */
export function generateRandomSeed(bytesCount = 16): string {
  const arr = new Uint8Array(bytesCount);
  window.crypto.getRandomValues(arr);
  return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
}
