/* Group Members:
   Khaleed Bryan | 2408864 | Lab Thursday 6-8PM
   Yashen Barracks | 2304973 | Lab Thursday 6-8PM
   Jordan Zhang | 2510220 | Lab Thursday 6-8PM
   Joel Nicholson | 2405543 | Lab Thursday 6-8PM
*/

// Students come from the admin page; ledger records are saved separately
const students = JSON.parse(localStorage.getItem("students")) || [];
let ledger = JSON.parse(localStorage.getItem("ledger")) || []; // {id, tuition, paid}

const form = document.getElementById("ledgerForm");
const select = document.getElementById("studentSelect");
const table = document.getElementById("ledgerTable");
const message = document.getElementById("message");
const search = document.getElementById("search");
const statusFilter = document.getElementById("statusFilter");
const semesterFilter = document.getElementById("semesterFilter");

// Status rules: Paid = nothing owed, Pending = part paid, Outstanding = nothing paid
function getStatus(r) {
  if (r.tuition > 0 && r.paid >= r.tuition) return "Paid";
  if (r.paid > 0) return "Pending";
  return "Outstanding";
}

// Fill the student dropdown and semester filter
function loadOptions() {
  select.innerHTML = '<option value="">Select student</option>';
  students.forEach(s => {
    select.innerHTML += `<option value="${s.id}">${s.id} - ${s.firstName} ${s.lastName}</option>`;
  });
  [...new Set(students.map(s => s.semester))].forEach(sem => {
    semesterFilter.innerHTML += `<option>${sem}</option>`;
  });
}

// Draw the table using the search + filters
function renderTable() {
  const text = search.value.toLowerCase();
  table.innerHTML = "";

  students.forEach(s => {
    const r = ledger.find(x => x.id === s.id) || { tuition: 0, paid: 0 };
    const status = getStatus(r);
    const name = s.firstName + " " + s.lastName;

    if (text && !(name.toLowerCase().includes(text) || s.id.includes(text))) return;
    if (statusFilter.value && statusFilter.value !== status) return;
    if (semesterFilter.value && semesterFilter.value !== s.semester) return;

    const row = document.createElement("tr");
    [s.id, name, s.semester, "$" + r.tuition, "$" + r.paid, "$" + (r.tuition - r.paid), status]
      .forEach((val, i) => {
        const td = document.createElement("td");
        td.textContent = val;
        if (i === 6) td.className = status;
        row.appendChild(td);
      });
    table.appendChild(row);
  });
}

// Save tuition and/or payment
form.addEventListener("submit", function (e) {
  e.preventDefault();
  const id = select.value;
  const tuition = Number(document.getElementById("tuition").value);
  const payment = Number(document.getElementById("payment").value);

  if (!id) { message.textContent = "Select a student."; return; }

  let record = ledger.find(x => x.id === id);
  if (!record) {
    record = { id: id, tuition: 0, paid: 0 };
    ledger.push(record);
  }
  if (tuition > 0) record.tuition = tuition;
  if (record.tuition <= 0) { message.textContent = "Enter the tuition first."; return; }
  if (payment > record.tuition - record.paid) {
    message.textContent = "Payment is more than the balance.";
    return;
  }
  record.paid += payment;

  localStorage.setItem("ledger", JSON.stringify(ledger));
  message.textContent = "Saved.";
  form.reset();
  renderTable();
});

// Live search and filters
search.addEventListener("input", renderTable);
statusFilter.addEventListener("change", renderTable);
semesterFilter.addEventListener("change", renderTable);
document.getElementById("printBtn").addEventListener("click", () => window.print());

loadOptions();
renderTable();
