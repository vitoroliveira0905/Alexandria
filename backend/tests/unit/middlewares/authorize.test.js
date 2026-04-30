// tests/unit/middlewares/authorize.test.js
import { describe, it, expect, vi } from 'vitest';
import authorize from '../../../src/middlewares/authorize.js';

describe('Middleware: authorize', () => {
    it('deve chamar next() quando o role está na lista permitida', () => {
        const req = { user: { role: 'admin' } };
        const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
        const next = vi.fn();

        authorize('admin')(req, res, next);

        expect(next).toHaveBeenCalledOnce();
    });

    it('deve retornar 403 quando o role não está na lista', () => {
        const req = { user: { role: 'user' } };
        const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
        const next = vi.fn();

        authorize('admin')(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(next).not.toHaveBeenCalled();
    });
});