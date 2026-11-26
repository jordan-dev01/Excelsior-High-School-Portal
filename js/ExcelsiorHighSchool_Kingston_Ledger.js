/* Group Members:
   Khaleed Bryan | 2408864 | Lab Thursday 6-8PM
   Yashen Barracks | 2304973 | Lab Thursday 6-8PM
   Jordan Zhang | 2510220 | Lab Thursday 6-8PM
   Joel Nicholson | 2405543 | Lab Thursday 6-8PM
*/

// students come from the admin page and then ledger records are saved separately
const students = JSON.parse(localStorage.getItem("students")) || [];
let ledger = JSON.parse(localStorage.getItem("ledger")) || []; // {id, tuition, paid, payments:[{amount, date}]}
ledger.forEach(r => { if (!r.payments) r.payments = []; });

let selectedId = ""; // student whose payment history is shown
let flashId = "";    // student row to highlight after saving

const form = document.getElementById("ledgerForm");
const select = document.getElementById("studentSelect");
const table = document.getElementById("ledgerTable");
const historyTable = document.getElementById("historyTable");
const message = document.getElementById("message");
const summary = document.getElementById("summary");
    const search = document.getElementById("search");
const statusFilter = document.getElementById("statusFilter");
  const semesterFilter = document.getElementById("semesterFilter");

// status rules stuff: paid = nothing owed, pending = part paid, outstanding = nothing paid
function getStatus(r) {
  if (r.tuition > 0 && r.paid >= r.tuition) return "Paid";
  if (r.paid > 0) return "Pending";
  return "Outstanding";
}

function saveData() {
  localStorage.setItem("ledger", JSON.stringify(ledger));
}

// fill the student dropdown and semester filter
function loadOptions() {
  select.innerHTML = '<option value="">Select student</option>';
  students.forEach(s => {
    select.innerHTML += `<option value="${s.id}">${s.id} - ${s.firstName} ${s.lastName}</option>`;
  });
  [...new Set(students.map(s => s.semester))].forEach(sem => {
    semesterFilter.innerHTML += `<option>${sem}</option>`;
  });
}

// totals for all the student dem   
function renderSummary() {
  let tuition = 0, paid = 0;
  const counts = { Paid: 0, Pending: 0, Outstanding: 0 };
  students.forEach(s => {
    const r = ledger.find(x => x.id === s.id) || { tuition: 0, paid: 0 };
    tuition += r.tuition;
    paid += r.paid;
    counts[getStatus(r)]++;
  });
  summary.textContent = "Collected: $" + paid + " | Owed: $" + (tuition - paid) +
    " | Paid: " + counts.Paid + " | Pending: " + counts.Pending + " | Outstanding: " + counts.Outstanding;
}

// draw the table using the search + filters
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
    row.dataset.id = s.id;
    if (s.id === flashId) row.className = "flash"; // highlight the row just saved
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

// payment history for the picked student
function renderHistory() {
  historyTable.innerHTML = "";
  const s = students.find(x => x.id === selectedId);
  const r = ledger.find(x => x.id === selectedId);
  document.getElementById("historyTitle").textContent =
    s ? "Payment History: " + s.firstName + " " + s.lastName : "Payment History";
  if (!r) return;

  r.payments.forEach((p, i) => {
    const row = document.createElement("tr");
    [p.date, "$" + p.amount].forEach(val => {
     const td = document.createElement("td");
   td.textContent = val;
      row.appendChild(td);
    });
    const td = document.createElement("td");
  td.innerHTML = `<button data-index="${i}">Delete</button>`;
  row.appendChild(td);
   historyTable.appendChild(row);
  });
}

function renderAll() {
  renderSummary();
  renderTable();
  renderHistory();
}

// save tuition and/or payment
form.addEventListener("submit", function (e) {
  e.preventDefault();
  const id = select.value;
  const tuition = Number(document.getElementById("tuition").value);
  const payment = Number(document.getElementById("payment").value);

  if (!id) { message.textContent = "Select a student."; return; }

  let record = ledger.find(x => x.id === id);
  if (!record) {
    record = { id: id, tuition: 0, paid: 0, payments: [] };
    ledger.push(record);
  }
  if (tuition > 0) {
    if (tuition < record.paid) { message.textContent = "Tuition cannot be less than the amount already paid."; return; }
    record.tuition = tuition;
  }
  if (record.tuition <= 0) { message.textContent = "Enter the tuition first."; return; }
  if (payment > record.tuition - record.paid) {
    message.textContent = "Payment is more than the balance.";
    return;
  }
  if (payment > 0) {
    record.paid += payment;
    record.payments.push({ amount: payment, date: new Date().toLocaleDateString() });
  }

  saveData();
  message.textContent = "Saved.";
  form.reset();
  selectedId = id;
  flashId = id;
  renderAll();
  setTimeout(() => { flashId = ""; }, 1500);
});

// click a student row to show their payments
table.addEventListener("click", function (e) {
  const row = e.target.closest("tr");
  if (!row) return;
  selectedId = row.dataset.id;
  renderHistory();
});

// delete a payment then it would update the balance and status auto
historyTable.addEventListener("click", function (e) {
  const index = e.target.dataset.index;
  if (index === undefined || !confirm("Delete this payment?")) return;
  const r = ledger.find(x => x.id === selectedId);
  r.paid -= r.payments[index].amount;
  r.payments.splice(index, 1);
  saveData();
  flashId = selectedId;
  renderAll();
  setTimeout(() => { flashId = ""; }, 1500);
  message.textContent = "Payment deleted.";
});

// live search and filters
search.addEventListener("input", renderTable);
statusFilter.addEventListener("change", renderTable);
semesterFilter.addEventListener("change", renderTable);
document.getElementById("printBtn").addEventListener("click", () => window.print());

loadOptions();
renderAll();
