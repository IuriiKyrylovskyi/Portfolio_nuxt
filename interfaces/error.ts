export interface IError {
  message: string;
  error: string;
  statusCode: number;
}

export interface IErrorResponse {
  response: {
    data: IError;
  };
}
