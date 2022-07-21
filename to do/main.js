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

async function getAllTasks() {
	const result = await fetch('http://localhost:3004/tasks');
	return await result.json();
}

async function deleteTask(task_id) {
	await fetch(`http://localhost:3004/tasks/${task_id}`, { method: 'DELETE' });
}

async function upsertTask(task) {
	await fetch(`http://localhost:3004/tasks
	`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(task)
	});
}



class Timer {
    constructor(root) {
      root.innerHTML = Timer.getHTML();
  
      this.el = {
        minutes: root.querySelector(".timer__part--minutes"),
        seconds: root.querySelector(".timer__part--seconds"),
        control: root.querySelector(".timer__btn--control"),
        reset: root.querySelector(".timer__btn--reset")
      };
  
      this.interval = null;
      this.remainingSeconds = 0;
  
      this.el.control.addEventListener("click", () => {
        if (this.interval === null) {
          this.start();
        } else {
          this.stop();
        }
      });
  
      this.el.reset.addEventListener("click", () => {
        const inputMinutes = prompt("Enter number of minutes:");
  
        if (inputMinutes < 60) {
          this.stop();
          this.remainingSeconds = inputMinutes * 60;
          this.updateInterfaceTime();
        }
      });
    }
  
    updateInterfaceTime() {
      const minutes = Math.floor(this.remainingSeconds / 60);
      const seconds = this.remainingSeconds % 60;
  
      this.el.minutes.textContent = minutes.toString().padStart(2, "0");
      this.el.seconds.textContent = seconds.toString().padStart(2, "0");
    }
  
    updateInterfaceControls() {
      if (this.interval === null) {
        this.el.control.innerHTML = `<span class="material-icons">play_arrow</span>`;
        this.el.control.classList.add("timer__btn--start");
        this.el.control.classList.remove("timer__btn--stop");
      } else {
        this.el.control.innerHTML = `<span class="material-icons">pause</span>`;
        this.el.control.classList.add("timer__btn--stop");
        this.el.control.classList.remove("timer__btn--start");
      }
    }
  
    start() {
      if (this.remainingSeconds === 0) return;
  
      this.interval = setInterval(() => {
        this.remainingSeconds--;
        this.updateInterfaceTime();
  
        if (this.remainingSeconds === 0) {
          this.stop();
        }
      }, 1000);
  
      this.updateInterfaceControls();
    }
  
    stop() {
      clearInterval(this.interval);
  
      this.interval = null;
  
      this.updateInterfaceControls();
    }
  
    static getHTML() {
      return `
              <span class="timer__part timer__part--minutes">00</span>
              <span class="timer__part">:</span>
              <span class="timer__part timer__part--seconds">00</span>
              <button type="button" class="timer__btn timer__btn--control timer__btn--start">
                  <span class="material-icons">play_arrow</span>
              </button>
              <button type="button" class="timer__btn timer__btn--reset">
                  <span class="material-icons">timer</span>
              </button>
          `;
    }
  }
  
  new Timer(
      document.querySelector(".timer")
  );

















