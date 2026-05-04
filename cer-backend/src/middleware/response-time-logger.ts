import responseTime from 'response-time';
import fs from 'fs';
import path from 'path';
import { LOG_PATH } from '../config/variables';

export const responseTimeLogger = responseTime((req: any, res: any, time: number) => {
    const now = new Date();
    const year = now.getFullYear().toString();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    const dir = path.join(LOG_PATH, year, month, day);
    fs.mkdirSync(dir, {recursive: true});

    const status = res.statusCode || 0;
    let filename: string;
    if (status >= 500) filename = 'error.log';
    else if (status >= 400) filename = 'client-error.log';
    else filename = 'success.log';

    const filepath = path.join(dir, filename);

    const forwarded = req.headers['x-forwarded-for'];
    const ip = (typeof forwarded === 'string'
            ? forwarded.split(',')[0]
            : forwarded?.[0])
        || req.socket?.remoteAddress
        || '-';

    const method = req.method || '-';
    const url = req.originalUrl || req.url || '-';

    const line = [
        now.toISOString(),
        ip,
        method,
        url,
        `status=${status}`,
        `${time.toFixed(2)}ms`
    ].join(' | ') + '\n';

    fs.appendFile(filepath, line, err => {
        if (err) console.error('response-time-logger error:', err);
    });
});
