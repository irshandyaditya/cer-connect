import multer from 'multer';
import { MAX_FILE_SIZE } from '../config/variables';

export const generalUpload = multer({
    storage: multer.memoryStorage(),
    limits: {fileSize: MAX_FILE_SIZE}
});