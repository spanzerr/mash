const crypto = require('crypto');
const { env } = require('../config/env');

const key = crypto.createHash('sha256').update(env.ENCRYPTION_KEY).digest();
const algorithm = 'aes-256-gcm';

function encrypt(value) {
  if (value === null || value === undefined) return null;
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  const encrypted = Buffer.concat([cipher.update(String(value), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${encrypted.toString('hex')}:${tag.toString('hex')}`;
}

function decrypt(value) {
  if (!value) return null;
  const [ivHex, encryptedHex, tagHex] = value.split(':');
  if (!ivHex || !encryptedHex || !tagHex) return null;

  const decipher = crypto.createDecipheriv(algorithm, key, Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(tagHex, 'hex'));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedHex, 'hex')),
    decipher.final()
  ]);

  return decrypted.toString('utf8');
}

module.exports = { encrypt, decrypt };
