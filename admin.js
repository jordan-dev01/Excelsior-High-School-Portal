// Student 3: Administrative Interface Developer
// Name: Yashen Barracks | ID#: 2304973 | Lab Thursday @ 6-9PM

const KEY = "students"; // shared localStorage key
let students = JSON.parse(localStorage.getItem(KEY)) || [];
let editingId = null; // null = add mode

const form = document.getElementById("studentForm");
const table = document.getElementById("studentTable");
const message = document.getElementById("message");
const saveBtn = document.getElementById("saveBtn");
const cancelBtn = document.getElementById("cancelBtn");

// Persist the array to localStorage
function saveData() {
  localStorage.setItem(KEY, JSON.stringify(students));
}

// Validation guards: returns an error string, or "" if valid
function validate(s) {
  if (!/^\d{5}$/.test(s.id)) return "Student ID must be exactly 5 digits.";
  if (!/^[A-Za-z' -]{2,}$/.test(s.firstName)) return "Enter a valid first name.";
  if (!/^[A-Za-z' -]{2,}$/.test(s.lastName)) return "Enter a valid last name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.email)) return "Enter a valid email.";
  if (!s.gradeLevel) return "Select a grade level.";
  if (!s.semester) return "Select a semester.";

  // Duplicate check (ignore the record being edited)
  const duplicate = students.some(x =>
    (x.id === s.id || x.email === s.email) && x.id !== editingId);
  if (duplicate) return "Student ID or email already exists.";
  return "";
}

// Builds the table rows from the array
function renderTable() {
  table.innerHTML = "";
  students.forEach(s => {
    const row = document.createElement("tr");
    const cells = [s.id, s.firstName + " " + s.lastName, s.email, s.gradeLevel, s.semester];
    cells.forEach(text => {
      const td = document.createElement("td");
      td.textContent = text;
      row.appendChild(td);
    });

    const actions = document.createElement("td");
    actions.innerHTML =
      `<button data-action="edit" data-id="${s.id}">Edit</button>
       <button data-action="delete" data-id="${s.id}">Delete</button>`;
    row.appendChild(actions);
    table.appendChild(row);
  });
}

// Resets the form back to add mode
function resetForm() {
  form.reset();
  editingId = null;
  saveBtn.textContent = "Add Student";
  cancelBtn.hidden = true;
  document.getElementById("id").disabled = false;
}

// Create / update
form.addEventListener("submit", function (e) {
  e.preventDefault();
  const student = {
    id: document.getElementById("id").value.trim(),
    firstName: document.getElementById("firstName").value.trim(),
    lastName: document.getElementById("lastName").value.trim(),
    email: document.getElementById("email").value.trim(),
    gradeLevel: document.getElementById("gradeLevel").value,
    semester: document.getElementById("semester").value
  };

  const error = validate(student);
  if (error) {
    message.textContent = error;
    return;
  }

  if (editingId) {
    const index = students.findIndex(x => x.id === editingId);
    students[index] = student;
    message.textContent = "Student updated.";
  } else {
    students.push(student);
    message.textContent = "Student added.";
  }

  saveData();
  renderTable();
  resetForm();
});

// Edit / Delete (event delegation on the table body)
table.addEventListener("click", function (e) {
  const id = e.target.dataset.id;
  if (!id) return;

  if (e.target.dataset.action === "delete") {
    if (confirm("Delete this student?")) {
      students = students.filter(x => x.id !== id);
      saveData();
      renderTable();
      message.textContent = "Student deleted.";
    }
  } else if (e.target.dataset.action === "edit") {
    const s = students.find(x => x.id === id);
    document.getElementById("id").value = s.id;
    document.getElementById("id").disabled = true; // ID is the key, so lock it
    document.getElementById("firstName").value = s.firstName;
    document.getElementById("lastName").value = s.lastName;
    document.getElementById("email").value = s.email;
    document.getElementById("gradeLevel").value = s.gradeLevel;
    document.getElementById("semester").value = s.semester;
    editingId = id;
    saveBtn.textContent = "Update Student";
    cancelBtn.hidden = false;
  }
});

cancelBtn.addEventListener("click", resetForm);

renderTable(); // load saved students on page load