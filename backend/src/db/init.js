import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import pool from './pool.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function initDb() {
  try {
    const schema = fs.readFileSync(
      path.join(__dirname, 'schema.sql'),
      'utf8'
    );

    await pool.query(schema);

    console.log('Database ready.');
  } catch (err) {
    console.error('Database initialization failed:', err.message);
  }
}