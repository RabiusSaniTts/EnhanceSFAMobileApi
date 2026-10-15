/**
 * @author MD.Rabius Sani Raju
 * @date 2026-10-15
 */

import mysql from 'mysql2/promise';
import { databaseConfig } from '../../config/database';

export const mysqlPool = mysql.createPool(databaseConfig);
