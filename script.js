// ================================
// 1. DOM References
// ================================
const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');

// ================================
// 2. Global State
// ================================
let tasks = [];
let currentFilter = 'all';

// ================================
// 3. Load Tasks from localStorage
// ================================
const savedTasks = JSON.parse(localStorage.getItem('tasks'));
if (savedTasks) {
    tasks = savedTasks;
    renderTasks();
}

// ================================
// 4. Render Functions
// ================================
function renderTask(taskObj) {
    const li = document.createElement('li');
    li.classList.add('task-item');
    li.setAttribute('draggable', 'true');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = taskObj.done;

    checkbox.addEventListener('change', () => {
        taskObj.done = checkbox.checked;
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderTasks();
    });

    const span = document.createElement('span');
    span.textContent = taskObj.text;
    span.style.marginLeft = '10px';

    if (taskObj.done) {
        span.style.textDecoration = 'line-through';
        span.style.opacity = 0.6;
    }

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '❌';
    deleteBtn.style.marginLeft = '10px';

    deleteBtn.addEventListener('click', () => {
        tasks = tasks.filter(task => task !== taskObj);
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderTasks();
    });

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(deleteBtn);
    taskList.appendChild(li);

    li.addEventListener('dragstart', () => li.classList.add('dragging'));
    li.addEventListener('dragend', () => {
        li.classList.remove('dragging');
        updateTaskOrder();
    });
}

function renderTasks() {
    taskList.innerHTML = '';
    const emptyMessage = document.getElementById('emptyMessage');

    let filteredTasks = tasks;

    if (currentFilter === 'active') {
        filteredTasks = tasks.filter(task => !task.done);
    } else if (currentFilter === 'completed') {
        filteredTasks = tasks.filter(task => task.done);
    }

    // Hide the message by default
    if (emptyMessage) emptyMessage.style.display = 'none';

    if (filteredTasks.length === 0) {
        // Choose a message based on context
        let message = '';

        if (tasks.length === 0) {
            message = "You're all caught up! 🎉";
        } else if (currentFilter === 'active') {
            message = "No active tasks left — nice job!";
        } else if (currentFilter === 'completed') {
            message = "No completed tasks yet.";
        } else {
            message = "Nothing to show.";
        }

        if (emptyMessage) {
            emptyMessage.textContent = message;
            emptyMessage.style.display = 'block';
        }
    } else {
        filteredTasks.forEach(renderTask);
    }
}

// ================================
// 5. Add Task
// ================================
function addTask() {
    const taskText = taskInput.value.trim();

    if (taskText !== '') {
        const newTask = { text: taskText, done: false };
        tasks.push(newTask);
        localStorage.setItem('tasks', JSON.stringify(tasks));

        // Reset filter to show all tasks
        currentFilter = 'all';

        // Highlight the "All" filter button
        document.querySelectorAll('#filterButtons button').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector('#filterButtons button[data-filter="all"]').classList.add('active');

        renderTasks();
        taskInput.value = '';
    }
}


// ================================
// 6. Event Listeners
// ================================
addTaskBtn.addEventListener('click', addTask);

taskInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        addTask();
    }
});

taskList.addEventListener('dragover', (e) => {
    e.preventDefault();
    const dragging = document.querySelector('.dragging');
    const afterElement = getDragAfterElement(taskList, e.clientY);
    if (afterElement == null) {
        taskList.appendChild(dragging);
    } else {
        taskList.insertBefore(dragging, afterElement);
    }
});


document.querySelectorAll('#filterButtons button').forEach(button => {
    button.addEventListener('click', () => {
        // Update filter state
        currentFilter = button.getAttribute('data-filter');

        // Remove 'active' class from all buttons
        document.querySelectorAll('#filterButtons button').forEach(btn => {
            btn.classList.remove('active');
        });

        // Add 'active' class to clicked button
        button.classList.add('active');

        // Re-render tasks
        renderTasks();
    });
});


// ================================
// 7. Helper Functions
// ================================
function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('li:not(.dragging)')];
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function updateTaskOrder() {
    const newOrder = [];
    const listItems = document.querySelectorAll('#taskList li');
    listItems.forEach(li => {
        const label = li.querySelector('span').textContent.trim();
        const matchedTask = tasks.find(t => t.text === label);
        if (matchedTask) newOrder.push(matchedTask);
    });
    tasks = newOrder;
    localStorage.setItem('tasks', JSON.stringify(tasks));
}


document.querySelector('#filterButtons button[data-filter="all"]').classList.add('active');
