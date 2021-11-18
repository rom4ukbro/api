const crypto = require('crypto');

export const GetUID7 = () => {
  let shift = 0;

  return Array(7)
    .fill(null)
    .map(() => {
      const char = 97 + ((Math.round(Math.random() * 26) + shift) % 26);
      shift += char;
      return String.fromCharCode(char);
    })
    .join('')
    .toUpperCase();
};

const algorithm = 'aes-256-ctr';
const secretKey = 'vOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3';
const iv = crypto.randomBytes(16);

export const encrypt = (text) => {
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);

  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

  return encrypted.toString('hex');
};

export const decrypt = (hash) => {
  const decipher = crypto.createDecipheriv(
    algorithm,
    secretKey,
    Buffer.from(iv, 'hex'),
  );

  const decrpyted = Buffer.concat([
    decipher.update(Buffer.from(hash, 'hex')),
    decipher.final(),
  ]);

  return decrpyted.toString();
};
