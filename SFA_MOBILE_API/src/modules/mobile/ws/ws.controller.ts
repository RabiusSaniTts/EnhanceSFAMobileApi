import { NotImplementedApiError } from '../../../shared/middleware/errors';

export async function checkLoad() {
  throw new NotImplementedApiError('ws/checkload');
}

export async function endDay() {
  throw new NotImplementedApiError('ws/endday');
}

export async function logout() {
  throw new NotImplementedApiError('ws/logout');
}

export async function getCustomerInvoice() {
  throw new NotImplementedApiError('ws/getcustinv');
}

export async function getCustomerBalance() {
  throw new NotImplementedApiError('ws/getcustomerbalance');
}

export async function getCustomerItemGroup() {
  throw new NotImplementedApiError('ws/getcustomeritemgrp');
}

export async function getDelivery() {
  throw new NotImplementedApiError('ws/getdelivery');
}

export async function getOrderStatus() {
  throw new NotImplementedApiError('ws/getorderstatus');
}

export async function getVisualData() {
  throw new NotImplementedApiError('ws/getvisualdata');
}

export async function getWarehouseStock() {
  throw new NotImplementedApiError('ws/getwarehousestock');
}

export async function getWhStock() {
  throw new NotImplementedApiError('ws/getwhstock');
}

export async function wsSendData() {
  throw new NotImplementedApiError('ws/senddata');
}
