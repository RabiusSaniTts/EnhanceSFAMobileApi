import { NotImplementedApiError } from '../../../shared/middleware/errors';

export async function uploadImage() {
  throw new NotImplementedApiError('image/upload');
}
