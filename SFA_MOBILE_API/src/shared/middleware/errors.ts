export class ApiError extends Error {
  public readonly statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

export class NotImplementedApiError extends ApiError {
  constructor(endpointName: string) {
    super(501, `${endpointName} migration is not implemented yet`);
  }
}
