import {RequestHandler} from 'express';
import {ALLOWED_HEADERS, ALLOWED_METHODS, ALLOWED_ORIGINS} from '../config/variables';
import {badRequest} from '../utils/response';

export const cors: RequestHandler = (req, res, next) => {
    const origin = req.headers.origin || '';
    if (ALLOWED_ORIGINS.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
        res.header('Access-Control-Allow-Headers', ALLOWED_HEADERS);
        res.header('Access-Control-Allow-Methods', ALLOWED_METHODS);
        if (req.method === 'OPTIONS') {
            res.sendStatus(200);
            return;
        }
        next();
        return;
    }

    if (req.method === 'OPTIONS') {
        badRequest(res, 'Not allowed by CORS');
        return;
    }
    next();
};
