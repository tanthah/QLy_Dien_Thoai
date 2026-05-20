const crypto = require('crypto');

const hashPassword = (password, salt) => {
  return crypto.createHmac('sha256', salt).update(password).digest('hex');
};

const createSaltedHash = (password) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = hashPassword(password, salt);
  return `${salt}:${hash}`;
};

const verifyPassword = (password, storedHash) => {
  if (typeof storedHash !== 'string' || !storedHash.includes(':')) {
    return false;
  }

  const [salt, hash] = storedHash.split(':');
  const inputHash = hashPassword(password, salt);
  return inputHash === hash;
};

module.exports = {
  createSaltedHash,
  verifyPassword,
};
