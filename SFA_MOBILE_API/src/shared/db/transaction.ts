import type { PoolConnection } from 'mysql2/promise';
import { mysqlPool } from './mysqlPool';

export async function withTransaction<T>(
  handler: (connection: PoolConnection) => Promise<T>
): Promise<T> {
  const connection = await mysqlPool.getConnection();

  try {
    await connection.beginTransaction();
    const result = await handler(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
