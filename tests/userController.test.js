jest.mock('../src/models/User');
const userController = require('../src/controllers/userController');
const User = require('../src/models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

jest.mock('../src/models/User');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('userController.register', () => {
  it('debería registrar un usuario y responder con mensaje', async () => {
    const req = { body: { username: 'test', password: '123456' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    bcrypt.hash.mockResolvedValueOnce('hashedPassword');
    User.prototype.save = jest.fn().mockResolvedValueOnce();
    await userController.register(req, res);
    expect(bcrypt.hash).toHaveBeenCalledWith('123456', 10);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ message: 'User registered' });
  });

  it('debería responder con error si falla el registro', async () => {
    const req = { body: { username: 'test', password: '123456' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    bcrypt.hash.mockRejectedValueOnce(new Error('Hash error'));
    await userController.register(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Hash error' });
  });
});

describe('userController.login', () => {
  it('debería responder con token si las credenciales son correctas', async () => {
    const req = { body: { username: 'test', password: '123456' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const user = { _id: 'userId', password: 'hashedPassword' };
    User.findOne = jest.fn().mockResolvedValueOnce(user);
    bcrypt.compare.mockResolvedValueOnce(true);
    jwt.sign.mockReturnValueOnce('token123');
    process.env.JWT_SECRET = 'secret';
    await userController.login(req, res);
    expect(User.findOne).toHaveBeenCalledWith({ username: 'test' });
    expect(bcrypt.compare).toHaveBeenCalledWith('123456', 'hashedPassword');
    expect(jwt.sign).toHaveBeenCalledWith({ id: 'userId' }, 'secret', { expiresIn: '1d' });
    expect(res.json).toHaveBeenCalledWith({ token: 'token123' });
  });

  it('debería responder con error si el usuario no existe', async () => {
    const req = { body: { username: 'test', password: '123456' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    User.findOne = jest.fn().mockResolvedValueOnce(null);
    await userController.login(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid credentials' });
  });

  it('debería responder con error si la contraseña es incorrecta', async () => {
    const req = { body: { username: 'test', password: 'wrongpass' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const user = { _id: 'userId', password: 'hashedPassword' };
    User.findOne = jest.fn().mockResolvedValueOnce(user);
    bcrypt.compare.mockResolvedValueOnce(false);
    await userController.login(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid credentials' });
  });

  it('debería responder con error si ocurre una excepción', async () => {
    const req = { body: { username: 'test', password: '123456' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    User.findOne = jest.fn().mockRejectedValueOnce(new Error('DB error'));
    await userController.login(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'DB error' });
  });
});
