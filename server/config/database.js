// Temporary: Skip database connection
const pool = null;

const testConnection = async () => {
  console.log('📝 Database temporarily disabled - focusing on frontend development');
  console.log('💡 Will configure PostgreSQL in next phase');
};

module.exports = { pool, testConnection };
