function autoHeight(elem) {  /* javascript */
	elem.style.height = '1px';
	elem.style.height = (elem.scrollHeight) + 'px';
}

const tasksDiv = document.getElementById('tasks');
const addTaskButton = document.getElementById('add-goal-button');

/// Array to save tasks in memory
let tasks = [];

/// Load saved tasks from local storage to memory
getTasksFromApi().then(apiTasks=>{
	tasks=apiTasks;
/// Update UI to reflect the actual data
	updateHtmlUi();
});
// const jsonString = localStorage.getItem('tasks');
// if (jsonString) {
// 	tasks = JSON.parse(jsonString);
// }

/// Update UI to reflect the actual data


/// Listen for clicking the add button to add new task
addTaskButton.addEventListener('click', async (event) => {

const newTask = {
	task_id: new BSON.ObjectID(),
	input: '',
	is_checked: false,
}
	/// Add to memory
await upsertTask(newTask)
	tasks.push(newTask);

	/// Update UI
	updateHtmlUi();
});



	/// Save to local storage
// 	saveToLocalStorage();
// });
//We don't need this function now
// function saveToLocalStorage() {
// 	const jsonString = JSON.stringify(tasks);
// 	localStorage.setItem('tasks', jsonString);
// }

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
		checkboxHtml.addEventListener('click', async(event) => {
			
			const updateTaskFromApi={
				//Update for check
				...tasks[i],
				is_checked:!tasks[i].is_checked

			};
			//update task in Api
			await upsertTask(updateTaskFromApi);
			//update task in memory
			tasks[i]=updateTaskFromApi;

			// tasks[i].isChecked = !tasks[i].isChecked;
			updateHtmlUi();
			// saveToLocalStorage();

		});
		newTaskHtml.appendChild(checkboxHtml);

		const textHtml = document.createElement('textarea');
		textHtml.className = 'task-input';
		textHtml.innerText = task.input;
		textHtml.oninput = (event) => {
			autoHeight(event.target);
			tasks[i].input = event.target.value;
			// saveToLocalStorage();
		};
		///Onblur start when we click outside the box
		textHtml.onblur = async(event) => {

			const updatedTask={
				//update input
				...tasks[i],
				input:event.target.value,

			}
			updateHtmlUi();}

		newTaskHtml.appendChild(textHtml);

		const spacerHtml = document.createElement('div');
		spacerHtml.className = 'spacer';
		newTaskHtml.appendChild(spacerHtml);

		const deleteIconHtml = document.createElement('div');
		deleteIconHtml.innerHTML = '<i class="fa-regular fa-trash-can"></i>';
		deleteIconHtml.addEventListener('click', async(event) => {
			///delete from
			const task_id=tasks[i].task_id;
			await deleteTasksFromApi(task_id);
			tasks = tasks.filter((t, index) => index !== i);
			updateHtmlUi();
			// saveToLocalStorage();
		});
		newTaskHtml.appendChild(deleteIconHtml);

		tasksDiv.appendChild(newTaskHtml);
	}

	const tasksInputs = document.getElementsByClassName('task-input');
	for (const child of tasksInputs) {
		autoHeight(child);
	}
}
async function getTasksFromApi(){
	const result =await fetch('http://0.0.0.0:3000/tasks');
	return await result.json();
}
// getTasksFromApi();
async function deleteTasksFromApi(task_id){
await fetch(`http://0.0.0.0:3000/tasks/${task_id}`,{method:'DELETE'});

}
async function upsertTask(task){
	await fetch('http://0.0.0.0:3000/tasks',{
		method:'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(task)
});
	
}