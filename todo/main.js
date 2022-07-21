const inputVal = document.getElementsByClassName('inputVal')[0];

 const addTaskBtn = document.getElementsByClassName('btn')[0];
 

addTaskBtn.addEventListener('click', function (){
  
if(inputVal.value.trim()!=0){


       let localItems = JSON.parse( localStorage.getItem('localItem'))
    if(localItems === null){
         taskList = []

    }else{
        taskList = localItems;
    }
    taskList.push(inputVal.value)
    localStorage.setItem('localItem', JSON.stringify(taskList)); 
}

    showItem()

     if(inputVal.value==0){
        alert("Please Enter a Task")
    }
})

function showItem(){
    let localItems = JSON.parse( localStorage.getItem('localItem'))
    if(localItems === null){
         taskList = []

    }else{
        taskList = localItems;
     
    }

let html = '';
let itemShow = document.querySelector('.todoLists');
taskList.forEach((data, index )=> {
    

    html += `
    <div class="todoList">
    <p class="pText">${data}</p>
    <input class="checktask" type="checkbox" value="">

    <button class="deleteTask" onClick="deleteItem(${index})">x</button>
    </div>
    `
})
itemShow.innerHTML = html;
}
showItem()

function deleteItem(index){
    let localItems = JSON.parse( localStorage.getItem('localItem'))
    taskList.splice(index, 1)
    localStorage.setItem('localItem', JSON.stringify(taskList));
    showItem()
}

function clearTask(){
    
localStorage.clear()
showItem()
}



async function getAllTasks() {
	const result = await fetch('http://0.0.0.0:3002/tasks');
	return await result.json();
}

async function deleteTask(task_id) {
	await fetch(`http://0.0.0.0:8080/3002/${task_id}`, { method: 'DELETE' });
}

async function addTask(task) {
	await fetch(`http://0.0.0.0:3002/tasks`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(task)
	});
}