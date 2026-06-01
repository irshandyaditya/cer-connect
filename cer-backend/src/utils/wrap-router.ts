/**
 * @packageDocumentation
 *
 * ## Description
 * Wraps an Express router to catch async handler errors and forward them to error middleware.
 *
 * ## Usage
 * ```ts
 * import { wrapRouter } from '@/utils/wrap-router';
 *
 * export default wrapRouter(router);
 * ```
 */

import {Router, Request, Response, NextFunction} from 'express';

export function wrapRouter(router: Router): Router {
    router.stack.forEach(layer => {
        if (!layer.route) return;
        layer.route.stack.forEach(handleLayer => {
            const orig = handleLayer.handle;
            if (orig.length === 3 || orig.length === 4) {
                handleLayer.handle = (req: Request, res: Response, next: NextFunction) => {
                    Promise.resolve(orig(req, res, next)).catch(next);
                };
            }
        });
    });
    return router;
}
