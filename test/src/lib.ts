import supertest from 'supertest';

export const apiUrl = `http://localhost:${process.env.PORT}/api`;

export const request = supertest(apiUrl);
