/* Group Members:
   Khaleed Bryan | 2408864 | Lab Thursday 6-8PM
   Yashen Barracks | 2304973 | Lab Thursday 6-8PM
   Jordan Zhang | 2510220 | Lab Thursday 6-8PM
   Joel Nicholson | 2405543 | Lab Thursday 6-8PM
*/

// Read everything from localStorage (read-only, nothing is changed here)
const students = JSON.parse(localStorage.getItem("students")) || [];
const ledger = JSON.parse(localStorage.getItem("ledger")) || [];
const grades = JSON.parse(localStorage.getItem("grades")) || []; // [{id, subject, score}]

const select = document.getElementById("studentSelect");
const profileTable = document.getElementById("profileTable");
const gradesTable = document.getElementById("gradesTable");
const financeTable = document.getElementById("financeTable");

// Add a row of cells to a table body
function addRow(tbody, cells, header) {
  const row = document.createElement("tr");
  cells.forEach((text, i) => {
    const td = document.createElement(header && i === 0 ? "th" : "td");
    td.textContent = text;
    row.appendChild(td);
  });
  tbody.appendChild(row);
}

// Show the profile, grades and finances for the chosen student
function showStudent() {
  profileTable.innerHTML = "";
  gradesTable.innerHTML = "";
  financeTable.innerHTML = "";

  const s = students.find(x => x.id === select.value);
  if (!s) return;

  addRow(profileTable, ["Student ID", s.id], true);
  addRow(profileTable, ["Name", s.firstName + " " + s.lastName], true);
  addRow(profileTable, ["Email", s.email], true);
  addRow(profileTable, ["Grade Level", s.gradeLevel], true);
  addRow(profileTable, ["Semester", s.semester], true);

  const myGrades = grades.filter(g => g.id === s.id);
  if (myGrades.length === 0) addRow(gradesTable, ["No grades recorded", ""]);
  myGrades.forEach(g => addRow(gradesTable, [g.subject, g.score]));

  const r = ledger.find(x => x.id === s.id) || { tuition: 0, paid: 0 };
  const status = r.tuition > 0 && r.paid >= r.tuition ? "Paid" : r.paid > 0 ? "Pending" : "Outstanding";
  addRow(financeTable, ["Total Tuition", "$" + r.tuition], true);
  addRow(financeTable, ["Amount Paid", "$" + r.paid], true);
  addRow(financeTable, ["Balance", "$" + (r.tuition - r.paid)], true);
  addRow(financeTable, ["Status", status], true);

  document.getElementById("printDate").textContent = "Printed: " + new Date().toLocaleDateString();
}

select.innerHTML = '<option value="">Select student</option>';
students.forEach(s => {
  select.innerHTML += `<option value="${s.id}">${s.id} - ${s.firstName} ${s.lastName}</option>`;
});
select.addEventListener("change", showStudent);
document.getElementById("printBtn").addEventListener("click", () => window.print());
