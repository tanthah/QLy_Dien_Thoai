const crypto = require('crypto');
const mysql = require('mysql2/promise');
const { DB } = require('../src/config/env');
const { createSaltedHash } = require('../src/utils/password');

const USERNAME_PATTERN = /^[A-Za-z0-9_]+$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[0-9]{9,15}$/;

const parseArgs = (args) => {
  const options = {};

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (!arg.startsWith('--')) continue;

    const [rawKey, inlineValue] = arg.slice(2).split('=');
    const key = rawKey.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    const nextValue = args[index + 1];

    if (inlineValue !== undefined) {
      options[key] = inlineValue;
    } else if (nextValue && !nextValue.startsWith('--')) {
      options[key] = nextValue;
      index += 1;
    } else {
      options[key] = true;
    }
  }

  return options;
};

const printHelp = () => {
  console.log(`
Usage:
  npm run admin:upsert -- --username admin1 --password admin123 --full-name "Admin 1" --email admin1@example.com --phone 0900000000

Options:
  --username    Tên đăng nhập admin, 3-50 ký tự, gồm chữ/số/gạch dưới
  --password    Mật khẩu đăng nhập, 6-128 ký tự
  --full-name   Họ tên admin
  --email       Email admin
  --phone       Số điện thoại admin, 9-15 chữ số
`);
};

const required = (options, key, label) => {
  const value = options[key];
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`${label} không được để trống`);
  }
  return value.trim();
};

const validateAdminInput = (options) => {
  const username = required(options, 'username', 'Tên đăng nhập');
  const password = required(options, 'password', 'Mật khẩu');
  const fullName = required(options, 'fullName', 'Họ và tên');
  const email = required(options, 'email', 'Email').toLowerCase();
  const phoneNumber = required(options, 'phone', 'Số điện thoại').replace(/[\s.-]/g, '');

  if (username.length < 3 || username.length > 50 || !USERNAME_PATTERN.test(username)) {
    throw new Error('Tên đăng nhập phải có 3-50 ký tự và chỉ gồm chữ, số, dấu gạch dưới');
  }

  if (password.length < 6 || password.length > 128) {
    throw new Error('Mật khẩu phải có từ 6 đến 128 ký tự');
  }

  if (fullName.length > 100) {
    throw new Error('Họ và tên không được vượt quá 100 ký tự');
  }

  if (email.length > 100 || !EMAIL_PATTERN.test(email)) {
    throw new Error('Email không hợp lệ');
  }

  if (!PHONE_PATTERN.test(phoneNumber)) {
    throw new Error('Số điện thoại phải gồm 9 đến 15 chữ số');
  }

  return { username, password, fullName, email, phoneNumber };
};

const findEmailOwner = async (connection, email) => {
  const [rows] = await connection.execute(
    'SELECT userID, username FROM User WHERE email = ?',
    [email]
  );
  return rows[0] || null;
};

const upsertAdmin = async ({ username, password, fullName, email, phoneNumber }) => {
  const connection = await mysql.createConnection({
    host: DB.host,
    user: DB.user,
    password: DB.password,
    database: DB.database,
  });

  try {
    const [users] = await connection.execute(
      'SELECT userID FROM User WHERE username = ?',
      [username]
    );
    const existingUser = users[0] || null;
    const emailOwner = await findEmailOwner(connection, email);

    if (emailOwner && (!existingUser || emailOwner.userID !== existingUser.userID)) {
      throw new Error(`Email "${email}" đang thuộc tài khoản "${emailOwner.username}"`);
    }

    const hashedPassword = createSaltedHash(password);

    if (existingUser) {
      await connection.execute(
        `UPDATE User
         SET password = ?, fullName = ?, email = ?, phoneNumber = ?, role = 'ADMIN'
         WHERE userID = ?`,
        [hashedPassword, fullName, email, phoneNumber, existingUser.userID]
      );
      return { action: 'updated', username };
    }

    await connection.execute(
      `INSERT INTO User (userID, username, password, fullName, email, phoneNumber, role)
       VALUES (?, ?, ?, ?, ?, ?, 'ADMIN')`,
      [crypto.randomUUID(), username, hashedPassword, fullName, email, phoneNumber]
    );
    return { action: 'created', username };
  } finally {
    await connection.end();
  }
};

const main = async () => {
  const options = parseArgs(process.argv.slice(2));
  if (options.help || options.h) {
    printHelp();
    return;
  }

  const adminInput = validateAdminInput(options);
  const result = await upsertAdmin(adminInput);
  const verb = result.action === 'created' ? 'Đã tạo' : 'Đã cập nhật';
  console.log(`${verb} tài khoản admin "${result.username}" thành công.`);
};

main().catch((err) => {
  console.error(`Lỗi: ${err.message}`);
  process.exitCode = 1;
});
