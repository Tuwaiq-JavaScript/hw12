const tasksDiv = document.getElementById('tasks');
const addTaskButton = document.getElementById('add-task-button');
const actionLetterDiv = document.getElementById('action-letter');

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
addTaskButton.addEventListener('click',async (event) => {

	/// Add to memory
	const newTaskInput = prompt('What do you want to add?');
	if (!newTaskInput) return;
	tasks.push({
		input: newTaskInput,
		id: new Date(),
		isChecked: false,
	});

	/// Save to local storage
	saveToLocalStorage();
	
	/// Update UI
	updateHtmlUi();
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
			saveToLocalStorage();
			updateHtmlUi();

		});
		newTaskHtml.appendChild(checkboxHtml);

		const textHtml = document.createElement('p');
		textHtml.innerText = task.input;
		newTaskHtml.appendChild(textHtml);

		newTaskHtml.addEventListener('dblclick', (event) => {
			event.preventDefault();
			if (didPressD) {
				const yes = confirm('are you sure?');
				if (!yes) {
					return;
				}
				tasks = tasks.filter((t, index) => index !== i);
				updateHtmlUi();
				saveToLocalStorage();
				didPressD = false;
				actionLetterDiv.innerText = 'P';
			} else {
				const value = prompt('What is the new value?');
				if (!value) {
					return;
				}
				tasks[i].input = value;
				updateHtmlUi();
				saveToLocalStorage();
			}
			return false;

		});

		// newTaskHtml.addEventListener('');

		tasksDiv.appendChild(newTaskHtml);
	}
}

let didPressD = false;
let didPressC = false;

window.addEventListener('keypress', (event) => {
	if (event.key === 'd') {
		didPressD = true;
		didPressC = false;
		actionLetterDiv.innerText = 'D';

	} else if (event.key === 'p') {
		didPressD = false;
		didPressC = false;
		actionLetterDiv.innerText = 'P';
	} else if (event.key === 'c') {
		didPressC = true;
		didPressD = false;
		actionLetterDiv.innerText = 'C';
	}
});
















