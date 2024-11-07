export const SQL_QUERIES = {
  FIND_USER_BY_ID: 'SELECT * FROM accounts WHERE id = ?',
  FIND_USER_BY_ID_PW: 'SELECT seq_no FROM accounts WHERE id = ? AND password = ?',
  INSERT_USER: `INSERT INTO accounts (id, email, bestScore, created_at, updatedTime) VALUES(?, ?, ?, ?, ?)`,
};
