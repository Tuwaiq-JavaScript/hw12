let input = document.getElementById('myInput');
let addTask = document.getElementById('add-task');
let output = document.getElementById('output');

let tasks = [];

getAllTasks().then((apiTasks) => {
	tasks = apiTasks;

	updateHtmlUi();
});

addTask.addEventListener('click', async (ev) => {
	const newTask = {
		TaskName: input.value,
		task_id: new BSON.ObjectID(),
		isChecked: false,
		input: '',
	};

	await upsertTask(newTask);
	tasks.push(newTask);

	updateHtmlUi();
});

function updateHtmlUi() {
	output.replaceChildren([]);
	for (let i = 0; i < tasks.length; i++) {
		const task = tasks[i];
		const newTaskHtml = document.createElement('div');
		const newBtnHtml2 = document.createElement('div');
		if (task.is_Checked) {
			newTaskHtml.className = 'add-task';
		} else {
			newTaskHtml.className = 'box';
			newBtnHtml2.className = 'btn3';
		}
		const checkboxHtml = document.createElement('p');
		const checkboxHtml2 = document.createElement('button');

		checkboxHtml.className = 'center';
		checkboxHtml2.className = 'btn3';
		checkboxHtml.innerHTML = task.TaskName;

		checkboxHtml.addEventListener('click', async (event) => {
			const updatedTask = {
				...tasks[i],
				is_checked: !tasks[i].is_checked,
			};
			await upsertTask(updatedTask);
			tasks[i] = updatedTask;
			updateHtmlUi();
		});
		newTaskHtml.appendChild(checkboxHtml);
		newBtnHtml2.appendChild(checkboxHtml2);

		// delete task
		const deleteTask = document.createElement('div');
		deleteTask.className = 'btn3';
		deleteTask.innerHTML = '   Delete';

		deleteTask.addEventListener('click', async (event) => {
			const task_id = tasks[i].task_id;
			await deleteTask(task_id);
			tasks = tasks.filter((t, index) => index !== i);
			updateHtmlUi();
		});
		newBtnHtml2.appendChild(deleteTask);
		//edit task
		const textHtml = document.createElement('textarea');
		textHtml.className = 'task-input';
		(textHtml.innerText = 'edit'), task.TaskName;

		textHtml.oninput = (event) => autoHeight(event.target);

		textHtml.onblur = async (event) => {
			const updatedTask = {
				...tasks[i].TaskName,
				input: event.target.value,
			};
			await upsertTask(updatedTask);
			tasks[i] = updatedTask;
			updateHtmlUi();
		};

		newTaskHtml.appendChild(textHtml);

		output.appendChild(newTaskHtml);
		output.appendChild(newBtnHtml2);
	}
	const tasksInputs = document.getElementsByClassName('task-input');
	for (const child of tasksInputs) {
		autoHeight(child);
	}
}
function autoHeight(elem) {
	elem.style.height = '1px';
	elem.style.height = elem.scrollHeight + 'px';
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
		body: JSON.stringify(task),
	});
}
