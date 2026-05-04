import { Response } from 'express';

export const send = (
    res: Response,
    code: number,
    msg: string,
    data?: any
) =>
    res.status(code).json({
        status: code < 300 ? 'success' : 'error',
        message: msg,
        ...(data !== undefined ? {data} : {}),
    });

export const ok = (res: Response, msg = 'Ok', data?: any) => send(res, 200, msg, data);
export const created = (res: Response, msg = 'Created', data?: any) => send(res, 201, msg, data);
export const accepted = (res: Response, msg = 'Accepted', data?: any) => send(res, 202, msg, data);
export const noContent = (res: Response) => res.sendStatus(204);

export const badRequest = (res: Response, msg = 'Bad Request') => send(res, 400, msg);
export const unauthorized = (res: Response, msg = 'Unauthorized') => send(res, 401, msg);
export const paymentRequired = (res: Response, msg = 'Payment Required') => send(res, 402, msg);
export const forbidden = (res: Response, msg = 'Forbidden') => send(res, 403, msg);
export const notFound = (res: Response, msg = 'Not Found') => send(res, 404, msg);
export const methodNotAllowed = (res: Response, msg = 'Method Not Allowed') => send(res, 405, msg);
export const notAcceptable = (res: Response, msg = 'Not Acceptable') => send(res, 406, msg);
export const proxyAuthenticationRequired = (res: Response, msg = 'Proxy Authentication Required') => send(res, 407, msg);
export const requestTimeout = (res: Response, msg = 'Request Timeout') => send(res, 408, msg);
export const conflict = (res: Response, msg = 'Conflict', data?: any) => send(res, 409, msg, data);
export const mismatch = (res: Response, msg = 'Mismatch', data?: any) => send(res, 409, msg, data);
export const gone = (res: Response, msg = 'Gone') => send(res, 410, msg);
export const lengthRequired = (res: Response, msg = 'Length Required') => send(res, 411, msg);
export const preconditionFailed = (res: Response, msg = 'Precondition Failed') => send(res, 412, msg);
export const payloadTooLarge = (res: Response, msg = 'Payload Too Large') => send(res, 413, msg);
export const uriTooLong = (res: Response, msg = 'URI Too Long') => send(res, 414, msg);
export const unsupportedMediaType = (res: Response, msg = 'Unsupported Media Type') => send(res, 415, msg);
export const rangeNotSatisfiable = (res: Response, msg = 'Range Not Satisfiable') => send(res, 416, msg);
export const expectationFailed = (res: Response, msg = 'Expectation Failed') => send(res, 417, msg);
export const imATeapot = (res: Response, msg = "I'm a teapot") => send(res, 418, msg);
export const misdirectedRequest = (res: Response, msg = 'Misdirected Request') => send(res, 421, msg);
export const unprocessableEntity = (res: Response, msg = 'Unprocessable Entity') => send(res, 422, msg);
export const locked = (res: Response, msg = 'Locked') => send(res, 423, msg);
export const failedDependency = (res: Response, msg = 'Failed Dependency') => send(res, 424, msg);
export const tooEarly = (res: Response, msg = 'Too Early') => send(res, 425, msg);
export const upgradeRequired = (res: Response, msg = 'Upgrade Required') => send(res, 426, msg);
export const preconditionRequired = (res: Response, msg = 'Precondition Required') => send(res, 428, msg);
export const tooManyRequests = (res: Response, msg = 'Too Many Requests') => send(res, 429, msg);
export const requestHeaderFieldsTooLarge = (res: Response, msg = 'Request Header Fields Too Large') => send(res, 431, msg);
export const unavailableForLegalReasons = (res: Response, msg = 'Unavailable For Legal Reasons') => send(res, 451, msg);

export const internalServerError = (res: Response, msg = 'Internal Server Error', data?: any) => send(res, 500, msg, data);
export const notImplemented = (res: Response, msg = 'Not Implemented') => send(res, 501, msg);
export const badGateway = (res: Response, msg = 'Bad Gateway') => send(res, 502, msg);
export const serviceUnavailable = (res: Response, msg = 'Service Unavailable') => send(res, 503, msg);
export const gatewayTimeout = (res: Response, msg = 'Gateway Timeout') => send(res, 504, msg);
export const httpVersionNotSupported = (res: Response, msg = 'HTTP Version Not Supported') => send(res, 505, msg);
export const variantAlsoNegotiates = (res: Response, msg = 'Variant Also Negotiates') => send(res, 506, msg);
export const insufficientStorage = (res: Response, msg = 'Insufficient Storage') => send(res, 507, msg);
export const loopDetected = (res: Response, msg = 'Loop Detected') => send(res, 508, msg);
export const notExtended = (res: Response, msg = 'Not Extended') => send(res, 510, msg);
export const networkAuthenticationRequired = (res: Response, msg = 'Network Authentication Required') => send(res, 511, msg);
