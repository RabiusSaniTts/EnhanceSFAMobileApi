import { createWriteStream } from 'fs';
import { mkdir } from 'fs/promises';
import path from 'path';
import { pipeline } from 'stream/promises';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { ApiError } from '../../../shared/middleware/errors';
import {
  customerSequence,
  sendData,
  uploadArTransactionDetails,
  uploadInvoiceTransactionDetails
} from './senddata.service';

const CUSTOMER_IMAGE_DIR = path.resolve(process.cwd(), 'public', 'customerimage');

export async function sendDataAction(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const result = await sendData(request, reply);
  await reply.send(result);
}

export async function customerSequenceAction(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const result = await customerSequence(request, reply);
  await reply.send(result);
}

export async function invoiceTransactionDetailAction(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const result = await uploadInvoiceTransactionDetails(request);
  await reply.send(result);
}

export async function arTransactionDetailAction(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const result = await uploadArTransactionDetails(request);
  await reply.send(result);
}

export async function uploadImageAction(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  if (!request.isMultipart()) {
    throw new ApiError(400, 'Image upload must be multipart/form-data');
  }

  const file = await request.file();

  if (!file || file.fieldname !== 'file') {
    throw new ApiError(400, 'Missing image file');
  }

  const fileName = sanitizeFileName(file.filename);

  if (fileName === '') {
    throw new ApiError(400, 'Invalid image filename');
  }

  await mkdir(CUSTOMER_IMAGE_DIR, { recursive: true });
  await pipeline(file.file, createWriteStream(path.join(CUSTOMER_IMAGE_DIR, fileName)));

  await reply.type('text/plain').send(`0The file ${fileName} has beenuploaded`);
}

function sanitizeFileName(fileName: string): string {
  return path.basename(fileName).replace(/[<>:"/\\|?*\x00-\x1F]/g, '').trim();
}
