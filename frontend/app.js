
const API_BASE = 'http://localhost:5000/api';
let token = localStorage.getItem('jwt') || '';

function showMessage(msg, isError = false) {
    const m = document.getElementById('message');
    m.textContent = msg;
    m.style.color = isError ? 'red' : 'green';
    setTimeout(() => { m.textContent = ''; }, 3000);
}

function showMain() {
    document.getElementById('authSection').style.display = 'none';
    document.getElementById('mainSection').style.display = '';
}
function showAuth() {
    document.getElementById('authSection').style.display = '';
    document.getElementById('mainSection').style.display = 'none';
}

document.getElementById('registerForm').onsubmit = async function (e) {
    e.preventDefault();
    const username = document.getElementById('regUsername').value;
    const password = document.getElementById('regPassword').value;
    try {
        const res = await fetch(`${API_BASE}/users/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (res.ok) {
            showMessage('Usuario registrado. Ahora inicia sesión.');
            document.getElementById('registerForm').reset();
        } else {
            showMessage(data.message || 'Error en registro', true);
        }
    } catch {
        showMessage('Error de red', true);
    }
};

document.getElementById('loginForm').onsubmit = async function (e) {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    try {
        const res = await fetch(`${API_BASE}/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (res.ok && data.token) {
            token = data.token;
            localStorage.setItem('jwt', token);
            showMain();
            fetchTasks();
            document.getElementById('loginForm').reset();
        } else {
            showMessage(data.message || 'Login incorrecto', true);
        }
    } catch {
        showMessage('Error de red', true);
    }
};

document.getElementById('logoutBtn').onclick = function () {
    token = '';
    localStorage.removeItem('jwt');
    showAuth();
};

async function fetchTasks() {
    if (!token) return;
    try {
        const res = await fetch(`${API_BASE}/tasks`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('No autorizado');
        const tasks = await res.json();
        const list = document.getElementById('taskList');
        list.innerHTML = '';
        tasks.forEach(task => {
            const li = document.createElement('li');
            const titleInput = document.createElement('input');
            titleInput.type = 'text';
            titleInput.value = task.title;
            titleInput.className = 'edit-title';
            titleInput.disabled = true;

            const editBtn = document.createElement('button');
            editBtn.textContent = 'Editar';
            editBtn.className = 'edit-btn';
            let editing = false;
            editBtn.onclick = () => {
                editing = !editing;
                titleInput.disabled = !editing;
                editBtn.textContent = editing ? 'Guardar' : 'Editar';
                if (!editing && titleInput.value !== task.title) {
                    updateTaskTitle(task._id, titleInput.value);
                }
            };

            const completeBtn = document.createElement('button');
        completeBtn.textContent = task.completed ? 'Desmarcar' : 'Completar';
        completeBtn.className = 'complete-btn';
        completeBtn.onclick = () => toggleTaskCompleted(task._id);

            if (task.completed) li.classList.add('done');

            const delBtn = document.createElement('button');
            delBtn.textContent = 'Eliminar';
            delBtn.className = 'delete-btn';
            delBtn.onclick = () => deleteTask(task._id);

            li.appendChild(titleInput);
            li.appendChild(editBtn);
            li.appendChild(completeBtn);
            li.appendChild(delBtn);
            list.appendChild(li);
        });
        async function updateTaskTitle(id, newTitle) {
            if (!token) return;
            try {
                await fetch(`${API_BASE}/tasks/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ title: newTitle })
                });
                fetchTasks();
            } catch {
                showMessage('Error al editar tarea', true);
            }
        }

        async function toggleTaskCompleted(id, completed) {
            if (!token) return;
            try {
                await fetch(`${API_BASE}/tasks/${id}/done`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                fetchTasks();
            } catch {
                showMessage('Error al actualizar tarea', true);
            }
        }
    } catch {
        showMessage('Error al obtener tareas', true);
    }
}

async function createTask(title) {
    if (!token) return;
    try {
        await fetch(`${API_BASE}/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ title })
        });
        fetchTasks();
    } catch {
        showMessage('Error al crear tarea', true);
    }
}

async function deleteTask(id) {
    if (!token) return;
    try {
        await fetch(`${API_BASE}/tasks/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        fetchTasks();
    } catch {
        showMessage('Error al eliminar tarea', true);
    }
}

document.getElementById('taskForm').onsubmit = function (e) {
    e.preventDefault();
    const input = document.getElementById('taskInput');
    if (input.value.trim()) {
        createTask(input.value.trim());
        input.value = '';
    }
};

if (token) {
    showMain();
    fetchTasks();
} else {
    showAuth();
}
