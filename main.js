
const courseDiv = document.getElementById('all-course');
const addCourseButton = document.getElementById('add-course');

/// Array to save course in memory
let courses = [];
 

getAllTasks().then(apiTasks => {
	courses = apiTasks;
	/// Update UI to reflect the actual data
	updateHtmlUi();
});




/// Listen for clicking the add button to add new course
addCourseButton.addEventListener('click', (event) => {

	/// Add to memory
	
	const newTask = {
		courses_id: new BSON.ObjectID(),
		is_checked: false,
		input: '',
	};
	await upsertTask(newTask);
	tasks.push(newTask);

	/// Update UI
	updateHtmlUi();
});



function updateHtmlUi() {
	courseDiv.replaceChildren([]);

	for (let i = 0; i < courses.length; i++) {
		const checkboxHtml = document.createElement('div');
		const course = courses[i];
		const newCourseHtml = document.createElement('div');
		if (course.isChecked) {
			newCourseHtml.className = 'box course checked';
			checkboxHtml.innerHTML = ' <span class=" material-symbols-outlined"> done_outline </span>';
		} else {
			newCourseHtml.className = 'box course';
		}

		checkboxHtml.className = 'check-box ';

		checkboxHtml.addEventListener('click',async (event) => {
			const updatedcourse = {
				...courses[i],
				is_checked: !courses[i].is_checked
			};
			await upsertTask(updatedcourse);
			courses[i] = updatedcourse;
			updateHtmlUi();
//  return false; 
		});
		newCourseHtml.appendChild(checkboxHtml);

		const courseHtml = document.createElement('textarea');
		courseHtml.className = 'course-input';
		courseHtml.innerText = course.input;
		textHtml.oninput = (event) => autoHeight(event.target);
		/// onblur works after moving outside the input
		textHtml.onblur = async (event) => {
			const updatedcourse = {
				...course[i],
				input: event.target.value,
			};
			await upsertTask(updatedcourse);
			course[i] = updatedcourse;
			updateHtmlUi();
		}; 



		newCourseHtml.appendChild(courseHtml);
		
		const spacerHtml = document.createElement('div');
		spacerHtml.className = 'spacer';
		newCourseHtml.appendChild(spacerHtml);

		const deleteIconHtml = document.createElement('div');
		deleteIconHtml.innerHTML = '<span class=" material-symbols-outlined"> done_outline </span>';
		deleteIconHtml.addEventListener('click',async (event) => {
			const courses_id = course[i].courses_id;
			await deleteTask(courses_id);
			course = course.filter((t, index) => index !== i);
			updateHtmlUi();
		});
		newCourseHtml.appendChild(deleteIconHtml);

		courseDiv.appendChild(newCourseHtml);
	}

	const courseInputs = document.getElementsByClassName('task-input');
	for (const child of courseInputs) {
		autoHeight(child);
	}
}
function autoHeight(elem) {  /* javascript */
	elem.style.height = '1px';
	elem.style.height = (elem.scrollHeight) + 'px';
}

async function getAllTasks() {
	const result = await fetch('http://127.0.0.1:3001/course/cousers');
	return await result.json();
}

async function deleteTask(course_id) {
	await fetch(`http://127.0.0.1:3001/course/${course_id}`, { method: 'DELETE' });
}

async function upsertTask(course) {
	await fetch(`http://127.0.0.1:3001/course/cousers`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(course)
	});
}















