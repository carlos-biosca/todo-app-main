//Variables
const newTodoForm = document.getElementById('new-todo-form');
const formTodos = document.getElementById('todo-list-form');
const todosList = document.getElementById('todo-list');
const todosListItems = document.querySelectorAll('.todo-list__item')
const filterRemaining = document.getElementById('filter-remaining');
const filterRemove = document.getElementById('filter-remove');
const filterList = document.getElementById('filter-list');
const filterButtons = document.querySelectorAll('.filter__button')
const toast = document.getElementById('toast');
const toggleMode = document.getElementById('toggle-icon')

let allTodos = [];
let mode = false

//Functions

const newTodo = todo => [...allTodos, todo];

const renderTodos = (todoList) => {
  todosList.textContent = ''
  const fragment = document.createDocumentFragment()
  for (todo of todoList) {
    const li = document.createElement('li')
    li.classList.add('todo-list__item')
    li.draggable = true
    const field = document.createElement('div')
    field.classList.add('form__field')
    field.id = todo.id
    const inputCheck = document.createElement('input')
    inputCheck.type = 'checkbox'
    inputCheck.name = 'todo'
    inputCheck.id = `todo-item-${todo.id}`
    inputCheck.checked = todo.completed
    inputCheck.classList.add('form__input', 'form__input--checkbox')
    field.appendChild(inputCheck)
    const label = document.createElement('label')
    label.htmlFor = inputCheck.id
    label.classList.add('form__label')
    field.appendChild(label)
    const inputValue = document.createElement('input')
    inputValue.type = 'text'
    inputValue.value = todo.todo
    inputValue.classList.add('form__input')
    inputValue.disabled = todo.completed
    field.appendChild(inputValue)
    const button = document.createElement('button')
    button.classList.add('form__button')
    const image = document.createElement('img')
    image.src = "./assets/icons/icon-cross.svg"
    image.alt = 'cross'
    button.appendChild(image)
    field.appendChild(button)
    li.appendChild(field)
    fragment.appendChild(li)
  }
  todosList.appendChild(fragment)
  todoIncomplete()
}

const deleteTodo = (id) => [...allTodos.filter(todo => todo.id != id)]

const updateTodo = (id, value) => {
  const index = allTodos.findIndex(todo => todo.id == id)
  if (value) {
    allTodos[index].todo = value
  } else {
    allTodos[index].completed = !allTodos[index].completed
  }
  todoIncomplete(allTodos)
}

const todoIncomplete = () => {
  const itemsLeft = allTodos.filter(todo => !todo.completed).length;
  filterRemaining.innerHTML = `${itemsLeft} items left`
}

const removeCompleted = () => allTodos.filter(todo => !todo.completed)

const filterOptions = (option) => {
  filterButtons.forEach((button) => {
    button.classList.remove('filter__button--active')
  })
  option.classList.add('filter__button--active')
  if (option.value === 'active') {
    return allTodos.filter(todo => !todo.completed)
  } else if (option.value === 'completed') {
    return allTodos.filter(todo => todo.completed)
  } else {
    return allTodos
  }
}

const toastShow = (message) => {
  toast.innerText = message
  toast.classList.add('toast--show')
  setTimeout(() => toast.classList.remove('toast--show'), 2000)
}

const disabledFormEnter = (e) => {
  e = e || event;
  var txtArea = /textarea/i.test((e.target || e.srcElement).tagName);
  return txtArea || (e.keyCode || e.which || e.charCode || 0) !== 13;
}

const setLocalStorage = () => {
  localStorage.setItem('todos', JSON.stringify(allTodos))
}

const getLocalStorage = () => {
  allTodos = JSON.parse(localStorage.getItem('todos'))
}

//Events

formTodos.onkeypress = disabledFormEnter;

newTodoForm.addEventListener('submit', e => {
  e.preventDefault()
  if (newTodoForm.todoValue.value == '') return toastShow('INSERT NEW VALUE')
  allTodos = newTodo({
    id: Date.now(),
    todo: newTodoForm.todoValue.value,
    completed: newTodoForm.todoCompleted.checked
  })
  setLocalStorage()
  renderTodos(allTodos);
  newTodoForm.todoCompleted.checked = false
  newTodoForm.todoValue.value = ''
  toastShow('ITEM ADDED')
})

todosList.addEventListener('click', e => {
  if (e.target.classList.contains('form__button')) {
    e.preventDefault()
    allTodos = deleteTodo(e.target.parentElement.id)
    document.getElementById(e.target.parentElement.id).parentElement.remove()
    todoIncomplete()
    toastShow('ITEM REMOVED')
  }
  if (e.target.classList.contains('form__label')) {
    updateTodo(e.target.parentElement.id)
    renderTodos(allTodos);
  }
  setLocalStorage()
})

todosList.addEventListener('keyup', e => {
  if (e.target.classList.contains('form__input') && e.key === 'Enter') {
    updateTodo(e.target.parentElement.id, e.target.value)
    setLocalStorage()
    e.target.blur()
    toastShow('ITEM UPDATED')
  }
})

filterRemove.addEventListener('click', () => {
  allTodos = removeCompleted()
  setLocalStorage()
  renderTodos(allTodos);
  toastShow('COMPLETED CLEARED')
})

filterList.addEventListener('click', e => {
  if (e.target.classList.contains('filter__button')) {
    const filteredTodos = filterOptions(e.target)
    renderTodos(filteredTodos)
  }
})

toggleMode.addEventListener('click', e => {
  !mode ? e.target.src = "assets/icons/icon-moon.svg" : e.target.src = "assets/icons/icon-sun.svg"
  mode = !mode
  document.body.classList.toggle('light-mode')
})

//Drag & drop

todosList.addEventListener('dragstart', e => {
  e.target.classList.add('dragging')
})

todosList.addEventListener('dragend', e => {
  e.target.classList.remove('dragging')
})

todosList.addEventListener('dragover', e => {
  e.preventDefault()
  const afterElement = getDragAfterElement(todosList, e.clientY)
  const draggable = document.querySelector('.dragging')
  if (afterElement == null) {
    todosList.appendChild(draggable)
  } else {
    todosList.insertBefore(draggable, afterElement)
  }
})

const getDragAfterElement = (container, y) => {
  const draggableElements = [...container.querySelectorAll('.todo-list__item:not(.dragging)')]
  console.log(draggableElements);
  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect()
    const offset = y - box.top - box.height / 2
    if (offset < 0 && offset > closest.offset) {
      return { offset: offset, element: child }
    } else {
      return closest
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element
}

//Init
window.addEventListener('load', () => {
  if (!localStorage.getItem('todos')) {
    localStorage.setItem('todos', JSON.stringify([]))
  } else {
    getLocalStorage()
  }
  renderTodos(allTodos);
})
