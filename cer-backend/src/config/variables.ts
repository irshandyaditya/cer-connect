import dotenv from 'dotenv';
import {env} from 'process';
import { httpError } from '../utils/http-error';

dotenv.config();

function getEnv(key: string, defaultValue?: string): string {
    const val = env[key] ?? defaultValue;
    if (val == null) {
        throw httpError(500, `Missing required environment variable: ${key}`);
    }
    return val;
}

function deriveFrontendUrl(baseUrl: string): string {
    try {
        const url = new URL(baseUrl);

        if (url.hostname.startsWith("api.")) {
            url.hostname = url.hostname.replace(/^api\./, "");
        }

        if (url.pathname.endsWith("/api")) {
            url.pathname = url.pathname.replace(/\/api$/, "");
        }

        return url.toString().replace(/\/+$/, "");
    } catch {
        return baseUrl;
    }
}

export const NODE_ENV = (env.NODE_ENV ?? 'development').toLowerCase();
export const PORT = parseInt(getEnv('PORT', '3000'), 10);
export const BASE_URL = getEnv('BASE_URL');
export const FE_BASE_URL = (env.FE_BASE_URL && env.FE_BASE_URL.trim() !== '')
    ? env.FE_BASE_URL.trim()
    : deriveFrontendUrl(BASE_URL);
export const DATABASE_URL = getEnv('DATABASE_URL');
export const API_PREFIX = getEnv('API_PREFIX', '').replace(/^\/+|\/+$/g, '');
export const API_URL = API_PREFIX ? `${BASE_URL}/${API_PREFIX}` : BASE_URL;

export const SECRET = getEnv('JWT_SECRET');
export const JWT_EXPIRES_IN = getEnv('JWT_EXPIRES_IN', '15m');
export const REFRESH_TOKEN_EXPIRES_IN = getEnv('REFRESH_TOKEN_EXPIRES_IN', '7d');

export const TIMEOUT = parseInt(getEnv('TIMEOUT', '5000'), 10);

export const MAX_FILE_SIZE = parseInt(getEnv('MAX_FILE_SIZE', '1048576'), 10);
export const MAX_FILE_COUNT = parseInt(getEnv('MAX_FILE_COUNT', '300'), 10);
export const TEMP_PATH = getEnv('TEMP_PATH', 'storage/temp');
export const LOG_PATH = getEnv('LOG_PATH', 'storage/logs');
export const IMAGE_PATH = getEnv('IMAGE_PATH', 'storage/uploads/photos');
export const SELFIE_PATH = getEnv('SELFIE_PATH', 'storage/uploads/selfies');

export const ALLOWED_ORIGINS = getEnv('ALLOWED_ORIGINS').split(',');
export const ALLOWED_HEADERS = getEnv('ALLOWED_HEADERS', 'Content-Type,Authorization,Accept');
export const ALLOWED_METHODS = getEnv('ALLOWED_METHODS', 'HEAD,GET,PUT,PATCH,POST,DELETE');

export const RATE_LIMIT_WINDOW_MS = parseInt(getEnv('RATE_LIMIT_WINDOW_MS', '60000'), 10);
export const RATE_LIMIT_MAX = parseInt(getEnv('RATE_LIMIT_MAX', '30'), 10);