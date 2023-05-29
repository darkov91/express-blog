export class ErrorResponse extends Error {
  public statusCode: number;

  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}
