import 'dotenv/config';
import express from 'express';
import path from 'path';
import { API_PREFIX, NODE_ENV } from './config/variables';
import { cors } from './middleware/cors';
import { errorHandler } from './middleware/error-handler';
import { limiter } from './middleware/limiter';
import { responseTimeLogger } from './middleware/response-time-logger';
import registerModules from './config/register-modules';
import * as R from './utils/response';

const app = express();

app.set('trust proxy', 1);

const base = API_PREFIX ? `/${API_PREFIX}` : '';

app.set('views', path.join(__dirname, '../docs'));
app.set('view engine', 'ejs');

if (NODE_ENV === 'development' || NODE_ENV === 'test') {
    app.get(`${base}/my-ip`, (req, res) => {
        R.ok(res, 'IP Fetched', {
            ip: req.ip,
            forwardedFor: req.headers['x-forwarded-for'] || null,
            userAgent: req.headers['user-agent'] || null,
        });
    });
}

app.use(express.json());
app.use(responseTimeLogger);
app.use(cors);

app.use(limiter);
app.use('/storage/uploads', express.static(path.join(__dirname, '..', 'storage', 'uploads')));
registerModules(app);
app.use(errorHandler);

export default app;
