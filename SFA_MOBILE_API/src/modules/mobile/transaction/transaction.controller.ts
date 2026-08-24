import { NotImplementedApiError } from '../../../shared/middleware/errors';

export async function transactionData() {
  throw new NotImplementedApiError('transaction/trandata');
}

export async function importInventoryCount() {
  throw new NotImplementedApiError('transaction/importinventorycount');
}
