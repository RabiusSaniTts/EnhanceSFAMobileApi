import type { FastifyReply, FastifyRequest } from 'fastify';

export type LegacyTransactionRequest = FastifyRequest;

export type LegacyTransactionReply = FastifyReply;

export type LegacyUploadItem = Record<string, string | number | null | undefined>;
