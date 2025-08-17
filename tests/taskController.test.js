const taskController = require('../src/controllers/taskController');
const Task = require('../src/models/Task');

jest.mock('../src/models/Task');


describe('taskController.getTasks', () => {
  it('debería responder con las tareas del usuario', async () => {
    const req = { user: { id: 'userId' } };
    const res = { json: jest.fn() };
    const tasks = [{ title: 'Task 1' }, { title: 'Task 2' }];
    Task.find = jest.fn().mockResolvedValueOnce(tasks);
    await taskController.getTasks(req, res);
    expect(Task.find).toHaveBeenCalledWith({ user: 'userId' });
    expect(res.json).toHaveBeenCalledWith(tasks);
  });

  it('debería responder con error si falla la consulta', async () => {
    const req = { user: { id: 'userId' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    Task.find = jest.fn().mockRejectedValueOnce(new Error('Find error'));
    await taskController.getTasks(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Find error' });
  });
});

describe('taskController.updateTask', () => {
  it('debería actualizar la tarea y responder con la tarea actualizada', async () => {
    const req = { params: { id: 'taskId' }, user: { id: 'userId' }, body: { title: 'Updated' } };
    const res = { json: jest.fn() };
    const updatedTask = { _id: 'taskId', title: 'Updated' };
    Task.findOneAndUpdate = jest.fn().mockResolvedValueOnce(updatedTask);
    await taskController.updateTask(req, res);
    expect(Task.findOneAndUpdate).toHaveBeenCalledWith({ _id: 'taskId', user: 'userId' }, req.body, { new: true });
    expect(res.json).toHaveBeenCalledWith(updatedTask);
  });

  it('debería responder con error si la tarea no existe', async () => {
    const req = { params: { id: 'taskId' }, user: { id: 'userId' }, body: {} };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    Task.findOneAndUpdate = jest.fn().mockResolvedValueOnce(null);
    await taskController.updateTask(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Task not found' });
  });

  it('debería responder con error si falla la actualización', async () => {
    const req = { params: { id: 'taskId' }, user: { id: 'userId' }, body: {} };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    Task.findOneAndUpdate = jest.fn().mockRejectedValueOnce(new Error('Update error'));
    await taskController.updateTask(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Update error' });
  });
});

describe('taskController.deleteTask', () => {
  it('debería eliminar la tarea y responder con mensaje', async () => {
    const req = { params: { id: 'taskId' }, user: { id: 'userId' } };
    const res = { json: jest.fn() };
    const deletedTask = { _id: 'taskId' };
    Task.findOneAndDelete = jest.fn().mockResolvedValueOnce(deletedTask);
    await taskController.deleteTask(req, res);
    expect(Task.findOneAndDelete).toHaveBeenCalledWith({ _id: 'taskId', user: 'userId' });
    expect(res.json).toHaveBeenCalledWith({ message: 'Task deleted' });
  });

  it('debería responder con error si la tarea no existe', async () => {
    const req = { params: { id: 'taskId' }, user: { id: 'userId' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    Task.findOneAndDelete = jest.fn().mockResolvedValueOnce(null);
    await taskController.deleteTask(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Task not found' });
  });

  it('debería responder con error si falla la eliminación', async () => {
    const req = { params: { id: 'taskId' }, user: { id: 'userId' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    Task.findOneAndDelete = jest.fn().mockRejectedValueOnce(new Error('Delete error'));
    await taskController.deleteTask(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Delete error' });
  });
});

describe('taskController.markDone', () => {
  it('debería marcar la tarea como hecha y responder con la tarea actualizada', async () => {
    const req = { params: { id: 'taskId' }, user: { id: 'userId' } };
    const res = { json: jest.fn() };
    const doneTask = { _id: 'taskId', done: true };
    Task.findOneAndUpdate = jest.fn().mockResolvedValueOnce(doneTask);
    await taskController.markDone(req, res);
    expect(Task.findOneAndUpdate).toHaveBeenCalledWith({ _id: 'taskId', user: 'userId' }, { done: true }, { new: true });
    expect(res.json).toHaveBeenCalledWith(doneTask);
  });

  it('debería responder con error si la tarea no existe', async () => {
    const req = { params: { id: 'taskId' }, user: { id: 'userId' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    Task.findOneAndUpdate = jest.fn().mockResolvedValueOnce(null);
    await taskController.markDone(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Task not found' });
  });

  it('debería responder con error si falla la actualización', async () => {
    const req = { params: { id: 'taskId' }, user: { id: 'userId' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    Task.findOneAndUpdate = jest.fn().mockRejectedValueOnce(new Error('Mark error'));
    await taskController.markDone(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Mark error' });
  });
});
