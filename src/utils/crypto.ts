// Client-side encryption utilities using Web Crypto API
class CryptoService {
  private key: CryptoKey | null = null;

  async generateKey(): Promise<CryptoKey> {
    return await window.crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: 256,
      },
      true,
      ['encrypt', 'decrypt']
    );
  }

  async deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );

    return await window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
  }

  async encrypt(data: string, key?: CryptoKey): Promise<string> {
    const cryptoKey = key || this.key;
    if (!cryptoKey) throw new Error('No encryption key available');

    const encoder = new TextEncoder();
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    
    const encrypted = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      cryptoKey,
      encoder.encode(data)
    );

    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);

    return btoa(String.fromCharCode(...combined));
  }

  async decrypt(encryptedData: string, key?: CryptoKey): Promise<string> {
    const cryptoKey = key || this.key;
    if (!cryptoKey) throw new Error('No decryption key available');

    const combined = new Uint8Array(
      atob(encryptedData)
        .split('')
        .map(char => char.charCodeAt(0))
    );

    const iv = combined.slice(0, 12);
    const data = combined.slice(12);

    const decrypted = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      cryptoKey,
      data
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  }

  setKey(key: CryptoKey) {
    this.key = key;
  }

  getKey(): CryptoKey | null {
    return this.key;
  }

  generateSalt(): Uint8Array {
    return window.crypto.getRandomValues(new Uint8Array(16));
  }
}

export const cryptoService = new CryptoService();