import type { FastifyReply, FastifyRequest } from 'fastify';
import {
  checkLoad as checkLoadService,
  endDay as endDayService,
  getCustomerBalance as getCustomerBalanceService,
  getCustomerInvoice as getCustomerInvoiceService,
  getCustomerItemGroup as getCustomerItemGroupService,
  getCustomerMaster as getCustomerMasterService,
  getDelivery as getDeliveryService,
  getImportInventoryCount as getImportInventoryCountService,
  getOrderStatus as getOrderStatusService,
  getTransactionData as getTransactionDataService,
  getVisualData as getVisualDataService,
  getWarehouseStock as getWarehouseStockService,
  getWhStock as getWhStockService,
  logout as logoutService,
  startDay
} from './ws.service';
import type {
  EndDayQuery,
  LogoutQuery,
  StartDayQuery
} from './types/startEndDay.types';
import type {
  CustomerMasterParams,
  CustomerMasterQuery,
  TransactionParams,
  TransactionQuery
} from './types/wsLookup.types';

export async function checkLoad(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const result = await checkLoadService(request, reply);
  await reply.type('text/plain').send(result);
}

export async function endDay(
  request: FastifyRequest<{ Querystring: EndDayQuery }>,
  reply: FastifyReply
): Promise<void> {
  const result = await endDayService(request, reply);
  await reply.type('text/plain').send(JSON.stringify(result));
}

export async function logout(
  request: FastifyRequest<{ Querystring: LogoutQuery }>,
  reply: FastifyReply
): Promise<void> {
  await logoutService(request, reply);
  await reply.send('');
}

export async function getCustomerInvoice(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const result = await getCustomerInvoiceService(request, reply);
  await reply.type('text/plain').send(JSON.stringify(result));
}

export async function getCustomerBalance(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const result = await getCustomerBalanceService(request, reply);
  await reply.type('text/plain').send(JSON.stringify(result));
}

export async function getCustomerItemGroup(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const result = await getCustomerItemGroupService(request, reply);
  await reply.type('text/plain').send(JSON.stringify(result));
}

export async function customerMaster(
  request: FastifyRequest<{
    Params: CustomerMasterParams;
    Querystring: CustomerMasterQuery;
  }>,
  reply: FastifyReply
): Promise<void> {
  const result = await getCustomerMasterService(request);
  await reply.type('text/plain').send(JSON.stringify(result));
}

export async function transactionData(
  request: FastifyRequest<{
    Params: TransactionParams;
    Querystring: TransactionQuery;
  }>,
  reply: FastifyReply
): Promise<void> {
  const result = await getTransactionDataService(request);
  await reply.type('text/plain').send(JSON.stringify(result));
}

export async function importInventoryCount(
  request: FastifyRequest<{
    Params: TransactionParams;
    Querystring: TransactionQuery;
  }>,
  reply: FastifyReply
): Promise<void> {
  const result = await getImportInventoryCountService(request);
  await reply.type('text/plain').send(JSON.stringify(result));
}

export async function getDelivery(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const result = await getDeliveryService(request, reply);
  await reply.type('text/plain').send(JSON.stringify(result));
}

export async function getOrderStatus(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const result = await getOrderStatusService(request, reply);
  await reply.type('text/plain').send(JSON.stringify(result));
}

export async function getVisualData(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const result = await getVisualDataService(request, reply);
  await reply.type('text/plain').send(JSON.stringify(result));
}

export async function getWarehouseStock(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const result = await getWarehouseStockService(request, reply);
  await reply.type('text/plain').send(JSON.stringify(result));
}

export async function getWhStock(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const result = await getWhStockService(request, reply);
  await reply.type('text/plain').send(JSON.stringify(result));
}

export async function wsSendData(
  request: FastifyRequest<{ Querystring: StartDayQuery }>,
  reply: FastifyReply
): Promise<void> {
  const result = await startDay(request, reply);
  await reply.type('text/plain').send(JSON.stringify(result));
}
