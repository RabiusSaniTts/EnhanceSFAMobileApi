import { NotImplementedApiError } from '../../../shared/middleware/errors';

export async function sendData() {
  throw new NotImplementedApiError('sync/senddata');
}

export async function customerSequence() {
  throw new NotImplementedApiError('sync/custseq');
}

export async function invoiceTransactionDetail() {
  throw new NotImplementedApiError('sync/invtxndetail');
}

export async function arTransactionDetail() {
  throw new NotImplementedApiError('sync/artxndetail');
}
