const tasksDiv = document.getElementById('tasks');
const addTaskButton = document.getElementById('add-task-button');

/// Array to save tasks in memory
let tasks = [];

/// Load saved tasks from local storage to memory
getAllTasks().then(apiTasks => {
	tasks = apiTasks;
	/// Update UI to reflect the actual data
	updateHtmlUi();
});
	


/// Listen for clicking the add button to add new task
addTaskButton.addEventListener('click', async (event) => {

	const newTask = {
		task_id: new BSON.ObjectID(),
		is_checked: false,
		input: '',
	};
	/// Add to memory
	await upsertTask(newTask);
	tasks.push(newTask);

	/// Update UI
	updateHtmlUi();
});



function updateHtmlUi() {
	tasksDiv.replaceChildren([]);

	for (let i = 0; i < tasks.length; i++) {
		const task = tasks[i];
		const newTaskHtml = document.createElement('div');
		if (task.is_checked) {
			newTaskHtml.className = 'box task-box checked';
		} else {
			newTaskHtml.className = 'box task-box';
		}

		const checkboxHtml = document.createElement('div');
		checkboxHtml.className = 'task-checkbox';
		checkboxHtml.innerHTML = '<i class="fa-solid fa-check icon"></i>';
		checkboxHtml.addEventListener('click', async (event) => {
			const updatedTask = {
				...tasks[i],
				is_checked: !tasks[i].is_checked
			};
			await upsertTask(updatedTask);
			tasks[i] = updatedTask;
			updateHtmlUi();
		});

		newTaskHtml.appendChild(checkboxHtml);

		const textHtml = document.createElement('textarea');
        textHtml.className='task-input';
		textHtml.innerText = task.input;
        textHtml.oninput = (event) => autoHeight(event.target);
		/// onblur works after moving outside the input
		textHtml.onblur = async (event) => {
			const updatedTask = {
				...tasks[i],
				input: event.target.value,
			};
            await upsertTask(updatedTask);
			tasks[i] = updatedTask;
			updateHtmlUi();
		};
		newTaskHtml.appendChild(textHtml);

        const spacerHtml=document.createElement('div');
        spacerHtml.className='spacer';
        newTaskHtml.appendChild(spacerHtml);
		const deleteIconHtml = document.createElement('div');
		deleteIconHtml.innerHTML = '<i class="fa-regular fa-trash-can"></i>';
		deleteIconHtml.addEventListener('click', async (event) => {
			const task_id = tasks[i].task_id;
			await deleteTask(task_id);
			tasks = tasks.filter((t, index) => index !== i);
			updateHtmlUi();
		});
		newTaskHtml.appendChild(deleteIconHtml);

		tasksDiv.appendChild(newTaskHtml);
	}

	const tasksInputs = document.getElementsByClassName('task-input');
	for (const child of tasksInputs) {
		autoHeight(child);
	}
}

function autoHeight(elem) {  /* javascript */
	elem.style.height = '1px';
	elem.style.height = (elem.scrollHeight) + 'px';
}

async function getAllTasks() {
	const result = await fetch('http://0.0.0.0:3000/tasks');
	return await result.json();
}

async function deleteTask(task_id) {
	await fetch(`http://0.0.0.0:3000/tasks/${task_id}`, { method: 'DELETE' });
}

async function upsertTask(task) {
	await fetch(`http://0.0.0.0:3000/tasks`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(task)
	});}