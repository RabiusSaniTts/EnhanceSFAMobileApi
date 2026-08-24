import type { FastifyReply, FastifyRequest } from 'fastify';
import { getMasterDataSync } from './masterdatasync.service';
import type { MasterDataSyncParams } from './masterdatasync.types';

export async function masterDataSyncAction(
  request: FastifyRequest<{ Params: MasterDataSyncParams }>,
  reply: FastifyReply
) {
  const result = await getMasterDataSync(request.params);
  await reply.send(result);
}
