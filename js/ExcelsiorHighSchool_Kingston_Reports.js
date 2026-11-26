/* Group Members:
   Khaleed Bryan | 2408864 | Lab Thursday 6-8PM
   Yashen Barracks | 2304973 | Lab Thursday 6-8PM
   Jordan Zhang | 2510220 | Lab Thursday 6-8PM
   Joel Nicholson | 2405543 | Lab Thursday 6-8PM
*/
// Universal Search + Reporting page (read-only: this file only READS from localStorage, it never saves).
// Data comes from the other pages: students (Admin), ledger (Ledger), grades (Teacher Panel).

const students = getData('students');
const ledger = getData('ledger');
const grades = getData('grades'); // [{id, subject, score}]

const searchInput = document.getElementById('searchInput');
const gradeFilter = document.getElementById('gradeFilter');
const semesterFilter = document.getElementById('semesterFilter');
const statusFilter = document.getElementById('statusFilter');
const resultsTable = document.getElementById('resultsTable');
const summary = document.getElementById('summary');
const detailSection = document.getElementById('detailSection');

// same status rules as the Ledger: paid = nothing owed, pending = part paid, outstanding = nothing paid
function getStatus(record) {
  if (record.tuition > 0 && record.paid >= record.tuition) return 'Paid';
  if (record.paid > 0) return 'Pending';
  return 'Outstanding';
}

// find a student's ledger record (or an empty one if they have none yet)
function getLedgerRecord(id) {
  return ledger.find(function (x) { return x.id === id; }) || { tuition: 0, paid: 0, payments: [] };
}

// average of all the student's scores, or null if they have no grades
function getAverage(id) {
  const mine = grades.filter(function (g) { return g.id === id; });
  if (mine.length === 0) return null;
  let total = 0;
  mine.forEach(function (g) { total += Number(g.score); });
  return total / mine.length;
}

// fill the grade and semester filters with the values that really exist
function loadFilterOptions() {
  [...new Set(students.map(function (s) { return s.gradeLevel; }))].forEach(function (g) {
    const opt = document.createElement('option');
    opt.textContent = g;
    gradeFilter.appendChild(opt);
  });
  [...new Set(students.map(function (s) { return s.semester; }))].forEach(function (sem) {
    const opt = document.createElement('option');
    opt.textContent = sem;
    semesterFilter.appendChild(opt);
  });
}

// draw the results table using the search box + the three filters
function renderResults() {
  const text = searchInput.value.trim().toLowerCase();
  resultsTable.innerHTML = '';

  let count = 0;
  let owed = 0;
  let scoreTotal = 0;
  let scoreCount = 0;
  const statusCounts = { Paid: 0, Pending: 0, Outstanding: 0 };

  students.forEach(function (s) {
    const record = getLedgerRecord(s.id);
    const status = getStatus(record);
    const name = s.firstName + ' ' + s.lastName;

    // skip students that do not match the search or the filters
    if (text && !(name.toLowerCase().includes(text) || s.id.includes(text) || s.email.toLowerCase().includes(text))) return;
    if (gradeFilter.value && gradeFilter.value !== s.gradeLevel) return;
    if (semesterFilter.value && semesterFilter.value !== s.semester) return;
    if (statusFilter.value && statusFilter.value !== status) return;

    const average = getAverage(s.id);
    const balance = record.tuition - record.paid;

    // totals for the summary line
    count++;
    owed += balance;
    statusCounts[status]++;
    if (average !== null) { scoreTotal += average; scoreCount++; }

    const row = document.createElement('tr');
    [s.id, name, s.gradeLevel, s.semester, average === null ? 'No grades' : average.toFixed(1), '$' + balance, status]
      .forEach(function (value, i) {
        const td = document.createElement('td');
        td.textContent = value;
        if (i === 6) td.className = status; // colour the status cell
        row.appendChild(td);
      });

    // a "View" button opens the full read-only details for this student
    const actionTd = document.createElement('td');
    const viewBtn = document.createElement('button');
    viewBtn.type = 'button';
    viewBtn.textContent = 'View';
    viewBtn.dataset.id = s.id;
    actionTd.appendChild(viewBtn);
    row.appendChild(actionTd);

    resultsTable.appendChild(row);
  });

  if (count === 0) {
    const row = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 8;
    td.textContent = students.length === 0 ? 'No students yet. Ask Admin to add some.' : 'No students match your search.';
    row.appendChild(td);
    resultsTable.appendChild(row);
  }

  summary.textContent = 'Students: ' + count +
    ' | Class average: ' + (scoreCount ? (scoreTotal / scoreCount).toFixed(1) : 'N/A') +
    ' | Total owed: $' + owed +
    ' | Paid: ' + statusCounts.Paid +
    ' | Pending: ' + statusCounts.Pending +
    ' | Outstanding: ' + statusCounts.Outstanding;
}

// add one row of cells to a table body (first cell is a header cell when "header" is true)
function addRow(tbody, cells, header) {
  const row = document.createElement('tr');
  cells.forEach(function (text, i) {
    const td = document.createElement(header && i === 0 ? 'th' : 'td');
    td.textContent = text;
    row.appendChild(td);
  });
  tbody.appendChild(row);
}

// show profile + grades + financial statement for one student together
function showDetails(id) {
  const s = students.find(function (x) { return x.id === id; });
  if (!s) return;

  const profile = document.getElementById('detailProfile');
  const gradeBody = document.getElementById('detailGrades');
  const finance = document.getElementById('detailFinance');
  profile.innerHTML = '';
  gradeBody.innerHTML = '';
  finance.innerHTML = '';

  document.getElementById('detailTitle').textContent = 'Details: ' + s.firstName + ' ' + s.lastName;
  addRow(profile, ['Student ID', s.id], true);
  addRow(profile, ['Name', s.firstName + ' ' + s.lastName], true);
  addRow(profile, ['Email', s.email], true);
  addRow(profile, ['Grade Level', s.gradeLevel], true);
  addRow(profile, ['Semester', s.semester], true);

  const mine = grades.filter(function (g) { return g.id === id; });
  if (mine.length === 0) addRow(gradeBody, ['No grades recorded', '']);
  mine.forEach(function (g) { addRow(gradeBody, [g.subject, g.score]); });

  const record = getLedgerRecord(id);
  addRow(finance, ['Total Tuition', '$' + record.tuition], true);
  addRow(finance, ['Amount Paid', '$' + record.paid], true);
  addRow(finance, ['Balance', '$' + (record.tuition - record.paid)], true);
  addRow(finance, ['Status', getStatus(record)], true);

  detailSection.hidden = false;
  detailSection.scrollIntoView({ behavior: 'smooth' });
}

// the nav only shows links the logged-in role is allowed to open
const viewer = getCurrentUser();
if (viewer && viewer.role === 'teacher') {
  document.querySelectorAll('.admin-only').forEach(function (li) { li.hidden = true; });
  document.querySelectorAll('.teacher-only').forEach(function (li) { li.hidden = false; });
}

// live search + filters
searchInput.addEventListener('input', renderResults);
gradeFilter.addEventListener('change', renderResults);
semesterFilter.addEventListener('change', renderResults);
statusFilter.addEventListener('change', renderResults);

document.getElementById('resetBtn').addEventListener('click', function () {
  searchInput.value = '';
  gradeFilter.value = '';
  semesterFilter.value = '';
  statusFilter.value = '';
  detailSection.hidden = true;
  renderResults();
});

// "View" buttons inside the table (event delegation)
resultsTable.addEventListener('click', function (e) {
  if (e.target.dataset.id) showDetails(e.target.dataset.id);
});

document.getElementById('printBtn').addEventListener('click', function () {
  document.getElementById('printDate').textContent = 'Printed: ' + new Date().toLocaleDateString();
  window.print();
});

document.getElementById('logoutLink').addEventListener('click', function (e) {
  e.preventDefault();
  logout();
});

loadFilterOptions();
renderResults();
