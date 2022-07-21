function autoHeight(elem) {  /* javascript */
	elem.style.height = '1px';
	elem.style.height = (elem.scrollHeight) + 'px';
}

const tasksDiv = document.getElementById('tasks');
const addTaskButton = document.getElementById('add-task-button');

/// Array to save tasks in memory
let tasks = [];

/// Load saved tasks from local storage to memory
const jsonString = localStorage.getItem('tasks');
if (jsonString) {
	tasks = JSON.parse(jsonString);
}

/// Update UI to reflect the actual data
updateHtmlUi();

/// Listen for clicking the add button to add new task
addTaskButton.addEventListener('click', (event) => {

	/// Add to memory

	tasks.push({
		id: new Date(),
		isChecked: false,
		input: '',
	});

	/// Update UI
	updateHtmlUi();

	/// Save to local storage
	saveToLocalStorage();
});

function saveToLocalStorage() {
	const jsonString = JSON.stringify(tasks);
	localStorage.setItem('tasks', jsonString);
}

function updateHtmlUi() {
	tasksDiv.replaceChildren([]);

	for (let i = 0; i < tasks.length; i++) {
		const task = tasks[i];
		const newTaskHtml = document.createElement('div');
		if (task.isChecked) {
			newTaskHtml.className = 'box task-box checked';
		} else {
			newTaskHtml.className = 'box task-box';
		}

		const checkboxHtml = document.createElement('div');
		checkboxHtml.className = 'task-checkbox';
		checkboxHtml.innerHTML = '<i class="fa-regular fa-face-grin-beam icon"></i>';
		checkboxHtml.addEventListener('click', (event) => {
			tasks[i].isChecked = !tasks[i].isChecked;
			updateHtmlUi();
			saveToLocalStorage();

		});
		newTaskHtml.appendChild(checkboxHtml);

		const textHtml = document.createElement('textarea');
		textHtml.className = 'task-input';
		textHtml.innerText = task.input;
		textHtml.oninput = (event) => {
			autoHeight(event.target);
			tasks[i].input = event.target.value;
			saveToLocalStorage();
		};
		textHtml.onblur = (event) => updateHtmlUi();

		newTaskHtml.appendChild(textHtml);

		const spacerHtml = document.createElement('div');
		spacerHtml.className = 'spacer';
		newTaskHtml.appendChild(spacerHtml);

		const deleteIconHtml = document.createElement('div');
		deleteIconHtml.innerHTML = '<i class="fa-regular fa-trash-can"></i>';
		deleteIconHtml.addEventListener('click', (event) => {
			tasks = tasks.filter((t, index) => index !== i);
			updateHtmlUi();
			saveToLocalStorage();
		});
		newTaskHtml.appendChild(deleteIconHtml);

		tasksDiv.appendChild(newTaskHtml);
	}

	const tasksInputs = document.getElementsByClassName('task-input');
	for (const child of tasksInputs) {
		autoHeight(child);
	}
}