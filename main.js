
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
		checkboxHtml.innerHTML = '<i class="fa-regular fa-face-grin-beam icon"></i>';
		checkboxHtml.addEventListener('click', async (event) => {
			const updatedTask = {
				...tasks[i],
				is_checked: !tasks[i].is_checked
			};
            //update in api
			await upsertTask(updatedTask);
			tasks[i] = updatedTask;
			updateHtmlUi();
		});
		newTaskHtml.appendChild(checkboxHtml);

		const textHtml = document.createElement('textarea');
		textHtml.className = 'task-input';
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

		const spacerHtml = document.createElement('div');
		spacerHtml.className = 'spacer';
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
 async function getallTasks(){
    const result =await fetch('http://127.0.0.1:3009/tasks');
      return await result.json();
} 
async function deleteTask (task_id){
    await fetch(`http://127.0.0.1:3009/tasks/${task_id}`, {method:'DELETE' });
}


async function upsertTask(task) {
	await fetch(`http://127.0.0.1:3009/tasks`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(task),
	});
}

// function autoHeight(elem) {  /* javascript */
// 	elem.style.height = '1px';
// 	elem.style.height = (elem.scrollHeight) + 'px';
// }

// const tasksDiv = document.getElementById('tasks');

// const addTaskButton = document.getElementById('add-task-button');

// /// Array to save tasks in memory
// let tasks = [];

// /// Load saved tasks from local storage to memory
// const jsonString = localStorage.getItem('tasks');
// if (jsonString) {
//    tasks = JSON.parse(jsonString);
// }

// /// Update UI to reflect the actual data
// updateHtmlUi();

// /// Listen for clicking the add button to add new task
// addTaskButton.addEventListener('click', (event) => {

// /// Add to memory

// tasks.push({
//     id: new Date(),
//     isChecked: false,
//     input: '',
// });
// /// Update UI
// updateHtmlUi();

// /// Save to local storage
// saveToLocalStorage();
// });
// // /// Update UI
// // updateHtmlUi();

// // /// Save to local storage
// // saveToLocalStorage();


// function saveToLocalStorage() {
//     const jsonString = JSON.stringify(tasks);
//     localStorage.setItem('tasks', jsonString);
//     }
    
//     function updateHtmlUi() {
//     tasksDiv.replaceChildren([]);
    
//     for (let i = 0; i < tasks.length; i++) {
//         const task = tasks[i];
//         const newTaskHtml = document.createElement('div');
//         if (task.isChecked) {
//             newTaskHtml.className = 'box task-box checked';
//         } else {
//             newTaskHtml.className = 'box task-box';
//         }
    
//         const checkboxHtml = document.createElement('div');
//         checkboxHtml.className = 'task-checkbox';
//         checkboxHtml.innerHTML = '<i class="fa-regular fa-face-grin-beam icon"></i>';
//         checkboxHtml.addEventListener('click', (event) => {
//             tasks[i].isChecked = !tasks[i].isChecked;
//             updateHtmlUi();
//             saveToLocalStorage();
    
//         });
//         newTaskHtml.appendChild(checkboxHtml);
    
//         const textHtml = document.createElement('textarea');
//         textHtml.className = 'task-input';
//         textHtml.innerText = task.input;
//         textHtml.oninput = (event) => {
//             autoHeight(event.target);
//             tasks[i].input = event.target.value;
//             saveToLocalStorage();
//         };
//         textHtml.onblur = (event) => updateHtmlUi();
    
//         newTaskHtml.appendChild(textHtml);
    
//         const spacerHtml = document.createElement('div');
//         spacerHtml.className = 'spacer';
//         newTaskHtml.appendChild(spacerHtml);
    
//         const deleteIconHtml = document.createElement('div');
//         deleteIconHtml.innerHTML = '<i class="fa-regular fa-trash-can"></i>';
//         deleteIconHtml.addEventListener('click', (event) => {
//             tasks = tasks.filter((t, index) => index !== i);
//             updateHtmlUi();
//             saveToLocalStorage();
//         });
//         newTaskHtml.appendChild(deleteIconHtml);
    
//         tasksDiv.appendChild(newTaskHtml);
//     }
    
//     const tasksInputs = document.getElementsByClassName('task-input');
//     for (const child of tasksInputs) {
//         autoHeight(child);
   
//     } }
    
























