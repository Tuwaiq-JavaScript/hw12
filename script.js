// TO-DO !

let tasks = [];

const todoListElement = document.querySelector("tasks");

document.querySelector("add_button").addEventListener("click", addTodo);
document.querySelector("myInput").addEventListener("keydown", function(e) {
  if (e.keyCode == 17) {
    addTodo()
  }
});

//-------GETTING VALUES FROM INPUT TO ARRAY OF OBJECTS-------
function addTodo() {
  const todoText = document.querySelector("myInput").value;

  if (todoText == "") {
    alert("You did not enter any task ! ! ! !");
  } else {
    tasks.push({
      input: todoText,
      id: new Date(),
      isChecked: false,
    });}
  

    //---WITH UNSHIFT WE ADD THE NEW ELEMENT TO THE BEGINNING OF THE ARRAY
    //--SO THAT THE NEW ITEMS SHOW UP ON TOP
	/// Update UI
	updateHtmlUi();

	/// Save to local storage
	saveToLocalStorage();
  }

  function updateHtmlUi() {
    todoListElement.replaceChildren([]);
  
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
      checkboxHtml.addEventListener('click', (event) => {
        tasks[i].isChecked = !tasks[i].isChecked;
        updateHtmlUi();
        saveToLocalStorage();
      });
      newTaskHtml.appendChild(checkboxHtml);
      const textHtml = document.createElement('p');
      textHtml.innerText = task.input;
      newTaskHtml.appendChild(textHtml);
  
      newTaskHtml.addEventListener('click', (event) => {
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

//------CHANGING THE isDone VALUE TO TRUE WHEN THE ELEMENT IS CLICKED
//------OR TO FALSE IF IT WAS TRUE BEFORE
function doneTodo(todoId) {
  const selectedTodoIndex = todoList.findIndex((item) => item.id == todoId);

  todoList[selectedTodoIndex].isDone
    ? (todoList[selectedTodoIndex].isDone = false)
    : (todoList[selectedTodoIndex].isDone = true);
  displayTodos();
}

//----TO DELETE AN ITEM; FROM THE LIST
function deleteItem(x) {
  todoList.splice(
    todoList.findIndex((item) => item.id == x),
    1
  );
  displayTodos();
}

//---------DISPLAYING THE ENTERED ITEMS ON THE SCREEN------
function displayTodos() {
  todoListElement.innerHTML = "";
  document.querySelector("#myInput").value = "";

  todoList.forEach((item) => {
    const listElement = document.createElement("li");
    const delBtn = document.createElement("i");

    listElement.innerHTML = item.todoText;
    listElement.setAttribute("data-id", item.id);

    delBtn.setAttribute("data-id", item.id);
    delBtn.classList.add("far");
    delBtn.classList.add("fa-trash-alt");
    delBtn.setAttribute("data-id", item.id);

    if (item.isDone) {
      listElement.classList.add("checked");
    }

    listElement.addEventListener("click", function (e) {
      const selectedId = e.target.getAttribute("data-id");
      doneTodo(selectedId);
    });

    delBtn.addEventListener("click", function (e) {
      const delId = e.target.getAttribute("data-id");
      deleteItem(delId);
    });

    todoListElement.appendChild(listElement);
    listElement.appendChild(delBtn);
  });
}
