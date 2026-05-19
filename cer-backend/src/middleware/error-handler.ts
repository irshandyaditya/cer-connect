import {NextFunction, Request, Response} from 'express';
import * as R from '../utils/response';
import { Prisma } from '@prisma/client';
import multer from 'multer';

export const errorHandler = (
    err: any,
    _req: Request,
    res: Response,
    _next: NextFunction
): void => {
    if (err instanceof multer.MulterError) {
        switch (err.code) {
            case 'LIMIT_UNEXPECTED_FILE':
                R.badRequest(res, "Expected a file field named 'file'. Only one file is allowed.");
                return;
            case 'LIMIT_FILE_SIZE':
                R.payloadTooLarge(res, "Uploaded file is too large. Please upload a smaller file.");
                return;
            case 'LIMIT_FILE_COUNT':
                R.badRequest(res, "Too many files uploaded. Only one file is allowed.");
                return;
            default:
                R.badRequest(res, err.message || "File upload error.");
                return;
        }
    }

    if (err instanceof Prisma.PrismaClientValidationError) {
        R.unprocessableEntity(res, 'Invalid data input.');
        return;
    }

    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        let message: any;

        switch (err.code) {
            case 'P2000':
                message = 'Input value is too long for the column.';
                break;
            case 'P2001':
                message = 'Record not found.';
                break;
            case 'P2002':
                const target = Array.isArray(err.meta?.target) ? (err.meta?.target as string[]) : [];
                message = `Duplicate value for field: ${target.join(', ') || 'unknown'}`;
                break;
            case 'P2003':
                const targets = Array.isArray(err.meta?.target) ? err.meta.target.join(', ') : err.meta?.field_name || 'unknown';
                const constraint = (err.meta as any)?.constraint;
                message = `Foreign key constraint failed on field(s): ${targets}` + (constraint ? ` (constraint: ${constraint})` : '');
                break;
            case 'P2004':
                message = 'Database constraint failed.';
                break;
            case 'P2005':
                message = 'Value stored in database for field is of invalid type.';
                break;
            case 'P2006':
                message = 'The provided value for a field is not valid.';
                break;
            case 'P2007':
                message = 'Data validation error.';
                break;
            case 'P2008':
                message = 'Query parsing error.';
                break;
            case 'P2009':
                message = 'Query validation error.';
                break;
            case 'P2010':
                message = 'Raw query failed.';
                break;
            case 'P2011':
                message = 'Null constraint violation on field.';
                break;
            case 'P2012':
                message = 'Missing required value.';
                break;
            case 'P2013':
                message = 'Missing required argument.';
                break;
            case 'P2014':
                message = 'The change would violate a relation constraint.';
                break;
            case 'P2015':
                message = 'Record not found for the relation.';
                break;
            case 'P2016':
                message = 'Query interpretation error.';
                break;
            case 'P2017':
                message = 'Records for a relation are not connected.';
                break;
            case 'P2018':
                message = 'The required connected records were not found.';
                break;
            case 'P2019':
                message = 'Input error.';
                break;
            case 'P2020':
                message = 'Value out of range for the type.';
                break;
            case 'P2021':
                message = 'Table not found in database.';
                break;
            case 'P2022':
                message = 'Column not found in database.';
                break;
            case 'P2023':
                message = 'Inconsistent column data.';
                break;
            case 'P2024':
                message = 'Timed out fetching a new connection from the database.';
                break;
            case 'P2025':
                message = 'Record to update/delete does not exist.';
                break;
            case 'P2026':
                message = 'Operation failed due to a database error.';
                break;
            case 'P2027':
                message = 'Multiple errors occurred on database.';
                break;
            case 'P2028':
                message = 'Transaction API error.';
                break;
            default:
                message = err.meta?.cause || err.message || 'Unexpected database error.';
                break;
        }

        R.badRequest(res, message.toString());
        return;
    }

    if (
        err instanceof Prisma.PrismaClientUnknownRequestError ||
        err instanceof Prisma.PrismaClientInitializationError ||
        err instanceof Prisma.PrismaClientRustPanicError ||
        err.constructor?.name?.startsWith('PrismaClient')
    ) {
        R.internalServerError(res, 'A database error occurred.');
        return;
    }

    const status = Number.isInteger(err.status) ? err.status : 500;
    const message = err.message || 'Internal Server Error';
    R.send(res, status, message);
    return;
};
