import mysql from 'mysql2/promise';
import { databaseConfig } from '../../config/database';

export const mysqlPool = mysql.createPool(databaseConfig);
