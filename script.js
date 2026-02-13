document.addEventListener("DOMContentLoaded", function(){

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let deletedCount = 0;
let editedCount = 0;
let originalOrder = [...tasks];

const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");
const addBtn = document.getElementById("addBtn");

addBtn.addEventListener("click", addTask);
taskInput.addEventListener("keypress", e => { if(e.key === "Enter") addTask(); });
document.addEventListener("keydown", e => { if(e.key === "Delete") deleteSelectedTasks(); });

function save(){ localStorage.setItem("tasks", JSON.stringify(tasks)); }
function updateCounters(){
  document.getElementById("totalCount").innerText = tasks.length;
  document.getElementById("completedCount").innerText = tasks.filter(t=>t.completed).length;
  document.getElementById("deletedCount").innerText = deletedCount;
  document.getElementById("editedCount").innerText = editedCount;
}

function addTask(){
  const text = taskInput.value.trim();
  if(!text) return alert("Task cannot be empty!");
  if(tasks.some(t=>t.text.toLowerCase()===text.toLowerCase())) return alert("Duplicate task!");
  tasks.push({text, completed:false});
  save(); render(); taskInput.value="";
}

function render(){
  taskList.innerHTML="";
  tasks.forEach((task,index)=>{
    const li = document.createElement("li");
    li.className="task";
    li.draggable = true;
    if(task.completed) li.classList.add("completed");

    const left = document.createElement("div");
    const checkbox = document.createElement("input");
    checkbox.type="checkbox";
    checkbox.checked = task.completed;
    checkbox.onchange = () => { task.completed = checkbox.checked; save(); render(); };

    const span = document.createElement("span");
    span.innerText = task.text;
    span.addEventListener("dblclick", ()=> editTask(span,index));
    addMobileEdit(span,index);

    left.appendChild(checkbox); left.appendChild(span);

    const right = document.createElement("div");
    const removeBtn = document.createElement("button");
    removeBtn.innerHTML = '<i class="fa fa-xmark"></i>';
    removeBtn.onclick = () => { if(confirm("Delete task: "+task.text+"?")) { tasks.splice(index,1); deletedCount++; save(); render(); } };
    right.appendChild(removeBtn);

    li.appendChild(left); li.appendChild(right);
    taskList.appendChild(li);

    li.addEventListener("dragstart",()=> li.classList.add("dragging"));
    li.addEventListener("dragend",()=> li.classList.remove("dragging"));
  });
  updateCounters();
}

taskList.addEventListener("dragover", e => {
  e.preventDefault();
  const dragging = document.querySelector(".dragging");
  if(dragging) taskList.appendChild(dragging);
});

function deleteSelectedTasks(){
  const selected = document.querySelectorAll(".selected");
  if(selected.length===0) return;
  if(confirm("Delete "+selected.length+" selected tasks?")){
    selected.forEach(el=>{
      const text = el.querySelector("span").innerText;
      tasks = tasks.filter(t=>t.text!==text);
      deletedCount++;
    });
    save(); render();
  }
}

function editTask(span,index){
  const oldText = span.innerText;
  const input = document.createElement("input");
  input.type="text";
  input.value = oldText;
  input.className = "edit-input";
  span.replaceWith(input);
  input.focus();

  function saveEdit(){
    const newText = input.value.trim();
    if(!newText){ alert("Task cannot be empty!"); input.focus(); return; }
    if(tasks.some((t,i)=>t.text.toLowerCase()===newText.toLowerCase() && i!==index)){ alert("Duplicate task!"); input.focus(); return; }
    tasks[index].text = newText; editedCount++; save(); render();
  }

  input.addEventListener("blur", saveEdit);
  input.addEventListener("keypress", e=>{ if(e.key==="Enter") saveEdit(); });
  input.addEventListener("keydown", e=> e.stopPropagation());
}

// Mobile long press / double tap
function addMobileEdit(span,index){
  let touchTimer=null,lastTap=0;
  span.addEventListener("touchstart", e => { touchTimer = setTimeout(()=>editTask(span,index),500); });
  span.addEventListener("touchend", e => { if(touchTimer) clearTimeout(touchTimer); });
  span.addEventListener("touchend", e => {
    const current = new Date().getTime();
    const tapLen = current - lastTap;
    if(tapLen<300 && tapLen>0) editTask(span,index);
    lastTap=current;
  });
}

window.sortAsc = function(){ tasks.sort((a,b)=>a.text.localeCompare(b.text)); save(); render(); };
window.sortDesc = function(){ tasks.sort((a,b)=>b.text.localeCompare(a.text)); save(); render(); };
window.resetOrder = function(){ tasks=[...originalOrder]; save(); render(); };
window.toggleTheme = function(){ document.body.classList.toggle("dark"); };

render();

});