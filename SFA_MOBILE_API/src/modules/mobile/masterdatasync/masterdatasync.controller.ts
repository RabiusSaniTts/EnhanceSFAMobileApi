import type { FastifyReply, FastifyRequest } from 'fastify';
import { getMasterDataSync } from './masterdatasync.service';

interface MasterDataSyncParams {
  routeid: string;
  userid: string;
  deviceid: string;
  mdate: string;
  table?: string;
}

export async function masterDataSyncAction(
  request: FastifyRequest<{ Params: MasterDataSyncParams }>,
  reply: FastifyReply
) {
  const result = await getMasterDataSync(request.params);
  await reply.send(result);
}
