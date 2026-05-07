const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

const dbPath = process.env.DB_PATH
  ? path.resolve(process.env.DB_PATH)
  : path.resolve(__dirname, 'kiara.db');

const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

function normalizeParams(params) {
  if (params.length === 0) return [];
  if (params.length === 1 && Array.isArray(params[0])) return params[0];
  return params;
}

function createWrapper(sqlDb) {
  function save() {
    const data = sqlDb.export();
    fs.writeFileSync(dbPath, Buffer.from(data));
  }

  return {
    exec(sql) {
      sqlDb.exec(sql);
      save();
      return this;
    },

    prepare(sql) {
      return {
        get(...params) {
          const args = normalizeParams(params);
          const stmt = sqlDb.prepare(sql);
          try {
            if (args.length > 0) stmt.bind(args);
            if (!stmt.step()) return undefined;
            return stmt.getAsObject();
          } finally {
            stmt.free();
          }
        },

        all(...params) {
          const args = normalizeParams(params);
          const stmt = sqlDb.prepare(sql);
          const results = [];
          try {
            if (args.length > 0) stmt.bind(args);
            while (stmt.step()) results.push(stmt.getAsObject());
          } finally {
            stmt.free();
          }
          return results;
        },

        run(...params) {
          const args = normalizeParams(params);
          const stmt = sqlDb.prepare(sql);
          try {
            if (args.length > 0) stmt.bind(args);
            stmt.step();
          } finally {
            stmt.free();
          }
          const changes = sqlDb.getRowsModified();
          const idStmt = sqlDb.prepare('SELECT last_insert_rowid() as id');
          let lastInsertRowid = 0;
          try {
            if (idStmt.step()) lastInsertRowid = idStmt.getAsObject().id;
          } finally {
            idStmt.free();
          }
          save();
          return { changes, lastInsertRowid };
        }
      };
    }
  };
}

// Exported as a plain object — populated after init() is called.
// Route files hold a reference to this same object, so they see
// the methods once server.js calls await db.init() at startup.
const db = {};

db.init = async function () {
  const SQL = await initSqlJs();
  const fileBuffer = fs.existsSync(dbPath) ? fs.readFileSync(dbPath) : null;
  const sqlDb = new SQL.Database(fileBuffer);
  sqlDb.run('PRAGMA foreign_keys = ON');
  Object.assign(db, createWrapper(sqlDb));
};

module.exports = db;
