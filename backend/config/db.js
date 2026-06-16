const SqliteAdapter = require('./sqlite-adapter');
const { initDatabase } = require('./init-db');

const pool = new SqliteAdapter();

const connectDB = async () => {
  try {
    await pool.connect();
    const nativeDb = pool.getNativeDb();
    await initDatabase(nativeDb);
    console.log('SQLite database connected successfully');
  } catch (error) {
    console.error(`Database Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = { connectDB, pool };
