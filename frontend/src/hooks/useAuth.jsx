import { useState, useCallback } from 'react';

const API_BASE_URL = 'http://localhost:3001/api';
const AUTH_TOKEN_KEY = 'alexandria:authToken';
const AUTH_USER_KEY = 'alexandria:authUser';

/**
 * Custom Hook responsável por controlar o login:
 * - Mantém email e password do formulário
 * - Faz a chamada para a API de autenticação
 * - Expõe o estado da requisição (user, token, loading, erro)
 */
export function useAuth({ initialUser = null } = {}) {
    const [user, setUser] = useState(() => {
        if (typeof window === 'undefined') {
            return initialUser;
        }

        const storedUser = window.localStorage.getItem(AUTH_USER_KEY);

        if (!storedUser) {
            return initialUser;
        }

        try {
            return JSON.parse(storedUser);
        } catch {
            return initialUser;
        }
    });
    const [token, setToken] = useState(() => {
        if (typeof window === 'undefined') {
            return null;
        }

        return window.localStorage.getItem(AUTH_TOKEN_KEY);
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const login = useCallback(async (credentials) => {
        const payload = credentials ?? { email, password };

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.message || `Erro ao fazer login (status ${response.status})`);
            }

            setUser(data.user);
            setToken(data.token);
            window.localStorage.setItem(AUTH_TOKEN_KEY, data.token);
            window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));

            return data;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro desconhecido');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [email, password]);

    return {
        user,
        token,
        loading,
        error,
        email,
        setEmail,
        password,
        setPassword,
        login,
    };
}