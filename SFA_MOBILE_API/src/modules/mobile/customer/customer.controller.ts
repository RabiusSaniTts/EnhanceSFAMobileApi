import { NotImplementedApiError } from '../../../shared/middleware/errors';

export async function customerMaster() {
  throw new NotImplementedApiError('customer/customermaster');
}
