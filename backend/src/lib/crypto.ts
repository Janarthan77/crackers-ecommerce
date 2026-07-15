import crypto from 'crypto';

// The encryption key should ideally be an environment variable.
// Using a fallback for demonstration/development purposes.
// Must be 32 bytes for AES-256
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'RRVCrackersSuperSecretAdminKey12'; // 32 chars
const IV_LENGTH = 16; // For AES, this is always 16

export function encrypt(text: string) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

export function decrypt(text: string) {
  try {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift() as string, 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (e) {
    console.error('Decryption failed', e);
    return null;
  }
}
