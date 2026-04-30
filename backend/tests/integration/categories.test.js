// tests/integration/categories.test.js
import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../server.js';
import { clearDatabase, closeDatabase } from '../helpers/db.js';
import { adminToken, userToken } from '../helpers/auth.js';

async function createCategory(token, data = {}) {
    return request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Romance', description: 'Obras de ficção romântica', ...data });
}

describe('Categories — CRUD', () => {
    beforeEach(async () => {
        await clearDatabase();
    });

    afterAll(closeDatabase);

    it('deve criar um categoria como admin e retornar 201', async () => {
        const res = await createCategory(adminToken(), { name: 'Romance' });

        expect(res.status).toBe(201);
        expect(res.body.name).toBe('Romance');
        expect(res.body).toHaveProperty('id');
    });

    it('deve retornar 403 ao tentar criar categoria como user', async () => {
        const res = await createCategory(userToken());
        expect(res.status).toBe(403);
    });

    it('deve retornar 400 quando name está ausente', async () => {
        const res = await request(app)
            .post('/api/categories')
            .set('Authorization', `Bearer ${adminToken()}`)
            .send({ description: 'Obras de ficção romântica' });

        expect(res.status).toBe(400);
    });

    it('deve listar categorias com paginação', async () => {
        await createCategory(adminToken(), { name: 'Romance' });
        await createCategory(adminToken(), { name: 'Ficção Científica' });

        const res = await request(app)
            .get('/api/categories?page=1&limit=10')
            .set('Authorization', `Bearer ${userToken()}`);

        expect(res.status).toBe(200);
        expect(res.body.data.length).toBeGreaterThanOrEqual(2);
    });

    it('deve retornar 404 ao buscar categoria inexistente', async () => {
        const res = await request(app)
            .get('/api/categories/99999')
            .set('Authorization', `Bearer ${userToken()}`);

        expect(res.status).toBe(404);
    });

    it('deve atualizar um categoria como admin', async () => {
        const created = await createCategory(adminToken(), { name: 'Nome Antigo' });
        const id = created.body.id;

        const res = await request(app)
            .put(`/api/categories/${id}`)
            .set('Authorization', `Bearer ${adminToken()}`)
            .send({ name: 'Nome Novo' });

        expect(res.status).toBe(200);
    });

    it('deve deletar um categoria como admin e retornar 204', async () => {
        const created = await createCategory(adminToken());
        const id = created.body.id;

        const res = await request(app)
            .delete(`/api/categories/${id}`)
            .set('Authorization', `Bearer ${adminToken()}`);

        expect(res.status).toBe(204);
    });
});