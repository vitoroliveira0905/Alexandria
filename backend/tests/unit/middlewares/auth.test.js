// tests/unit/middlewares/auth.test.js
import { describe, it, expect, vi } from 'vitest';
import jwt from 'jsonwebtoken';
import authenticate from '../../../src/middlewares/auth.js';

process.env.JWT_SECRET = 'segredo_teste';

function mockReqRes(authHeader) {
    const req = { headers: { authorization: authHeader } };
    const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
    };
    const next = vi.fn();
    return { req, res, next };
}

describe('Middleware: authenticate', () => {
    it('deve chamar next() com token válido', () => {
        const token = jwt.sign({ id: 1, role: 'user' }, 'segredo_teste', { expiresIn: '1h' });
        const { req, res, next } = mockReqRes(`Bearer ${token}`);

        authenticate(req, res, next);

        expect(next).toHaveBeenCalledOnce();
        expect(req.user).toHaveProperty('id', 1);
    });

    it('deve retornar 401 sem header Authorization', () => {
        const { req, res, next } = mockReqRes(undefined);

        authenticate(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });

    it('deve retornar 401 com token malformado', () => {
        const { req, res, next } = mockReqRes('Bearer token.invalido');

        authenticate(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
    });

    it('deve retornar 401 com token expirado', () => {
        const token = jwt.sign({ id: 1 }, 'segredo_teste', { expiresIn: '-1s' });
        const { req, res, next } = mockReqRes(`Bearer ${token}`);

        authenticate(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
    });

    it('deve retornar 401 sem o prefixo Bearer', () => {
        const token = jwt.sign({ id: 1 }, 'segredo_teste');
        const { req, res, next } = mockReqRes(token); // sem "Bearer "

        authenticate(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
    });
});
