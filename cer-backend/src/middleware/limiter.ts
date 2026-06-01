import rateLimit from 'express-rate-limit';
import type {Request} from 'express';
import {RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS} from '../config/variables';
import {tooManyRequests} from '../utils/response';
import type {IncomingHttpHeaders} from 'http';

export const limiter = rateLimit({
    windowMs: RATE_LIMIT_WINDOW_MS,
    max: RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req: Request): string => {
        const headers = req.headers as IncomingHttpHeaders;
        const forwarded = headers['x-forwarded-for'];

        let ip = typeof forwarded === 'string'
            ? forwarded.split(',')[0]?.trim() || 'unknown'
            : req.ip ?? req.socket?.remoteAddress ?? 'unknown';

        if (ip.includes(':')) {
            ip = ip.split(':').pop() || ip;
        }

        return ip;
    },
    handler: (_req, res) => tooManyRequests(res),
});
