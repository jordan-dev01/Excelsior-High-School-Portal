/* Group Members:
   Khaleed Bryan | 2408864 | Lab Thursday 6-8PM
   Yashen Barracks | 2304973 | Lab Thursday 6-8PM
   Jordan Zhang | 2510220 | Lab Thursday 6-8PM
   Joel Nicholson | 2405543 | Lab Thursday 6-8PM
*/
// Teacher Panel logic (needs Storage.js loaded first).
// Reads students saved by the Admin page; saves grades as [{id, subject, score}] (read by the Printable Profile).

const students = getData('students');
let grades = getData('grades');
const me = getCurrentUser() || {};

const tableBody = document.getElementById('teacherStudentTable');
const generateXmlBtn = document.getElementById('generateXmlBtn');
const xmlOutput = document.getElementById('xmlOutput');
const subjectSelect = document.getElementById('subjectSelect');
const gradeTable = document.getElementById('gradeTable');
const gradePlaceholder = document.getElementById('gradePlaceholder');
const reportStudent = document.getElementById('reportStudent');
const reportCard = document.getElementById('reportCard');

document.getElementById('logoutLink').addEventListener('click', function (e) {
  e.preventDefault();
  logout();
});

// Small helper: build a <td> safely (textContent, so student data can never inject HTML)
function cell(text) {
  const td = document.createElement('td');
  td.textContent = text;
  return td;
}

// ---------- Student list ----------
function loadTable() {
  tableBody.innerHTML = '';

  if (students.length === 0) {
    const row = document.createElement('tr');
    const td = cell('No students found. Ask Admin to add some.');
    td.colSpan = 5;
    row.appendChild(td);
    tableBody.appendChild(row);
    return;
  }

  students.forEach(function (s) {
    const row = document.createElement('tr');
    [s.id, s.firstName + ' ' + s.lastName, s.email, s.gradeLevel, s.semester].forEach(function (v) {
      row.appendChild(cell(v));
    });
    tableBody.appendChild(row);
  });
}

// XML export (Unit 4) - special characters are escaped so the output is valid XML
function escapeXml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function generateXML() {
  let xml = '<?xml version="1.0"?>\n<students>\n';
  students.forEach(function (s) {
    xml += '  <student>\n';
    xml += '    <id>' + escapeXml(s.id) + '</id>\n';
    xml += '    <name>' + escapeXml(s.firstName + ' ' + s.lastName) + '</name>\n';
    xml += '    <email>' + escapeXml(s.email) + '</email>\n';
    xml += '  </student>\n';
  });
  xml += '</students>';

  xmlOutput.textContent = xml;
  xmlOutput.style.display = 'block';
}

// ---------- Subject dropdown (only the teacher's own subjects, or all if none assigned) ----------
function loadSubjects() {
  const all = getData('subjects');
  const mine = Array.isArray(me.subjects) && me.subjects.length ? me.subjects : null;

  all.forEach(function (s) {
    if (mine && mine.indexOf(s.name) === -1) return;
    const opt = document.createElement('option');
    opt.value = s.name;
    opt.textContent = s.name;
    subjectSelect.appendChild(opt);
  });
}

// ---------- Grade entry ----------
function findGrade(id, subject) {
  return grades.find(function (g) {
    return g.id === id && g.subject === subject;
  });
}

function renderGradeTable() {
  const subject = subjectSelect.value;
  gradeTable.innerHTML = '';

  if (!subject) {
    gradePlaceholder.textContent = 'Choose a subject to load the student list.';
    return;
  }
  if (students.length === 0) {
    gradePlaceholder.textContent = 'No students found. Ask Admin to add some.';
    return;
  }
  gradePlaceholder.textContent = 'Enter scores (0 - 100) for ' + subject + '.';

  students.forEach(function (s) {
    const row = document.createElement('tr');
    row.appendChild(cell(s.id));
    row.appendChild(cell(s.firstName + ' ' + s.lastName));

    const input = document.createElement('input');
    input.type = 'number';
    input.min = 0;
    input.max = 100;
    input.step = 'any';
    input.setAttribute('aria-label', 'Score for ' + s.firstName + ' ' + s.lastName);
    const existing = findGrade(s.id, subject);
    if (existing) input.value = existing.score;
    const gradeTd = document.createElement('td');
    gradeTd.appendChild(input);
    row.appendChild(gradeTd);

    const saveTd = document.createElement('td');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = 'Save';
    const note = document.createElement('span');
    note.setAttribute('role', 'status');
    btn.addEventListener('click', function () {
      const raw = input.value.trim();
      const score = Number(raw);
      if (raw === '' || isNaN(score) || score < 0 || score > 100) {
        note.textContent = ' Enter a score from 0 to 100.';
        return;
      }
      const record = findGrade(s.id, subject);
      if (record) {
        record.score = score;
      } else {
        grades.push({ id: s.id, subject: subject, score: score });
      }
      saveData('grades', grades);
      note.textContent = ' Saved.';
      renderReportCard();
    });
    saveTd.appendChild(btn);
    saveTd.appendChild(note);
    row.appendChild(saveTd);

    gradeTable.appendChild(row);
  });
}

// ---------- Report card ----------
function loadReportStudents() {
  students.forEach(function (s) {
    const opt = document.createElement('option');
    opt.value = s.id;
    opt.textContent = s.id + ' - ' + s.firstName + ' ' + s.lastName;
    reportStudent.appendChild(opt);
  });
}

function renderReportCard() {
  reportCard.innerHTML = '';
  const s = students.find(function (x) {
    return x.id === reportStudent.value;
  });
  if (!s) return;

  const title = document.createElement('h3');
  title.textContent = 'Report Card: ' + s.firstName + ' ' + s.lastName + ' (' + s.gradeLevel + ')';
  reportCard.appendChild(title);

  const mine = grades.filter(function (g) {
    return g.id === s.id;
  });

  const table = document.createElement('table');
  table.className = 'directory-table';
  const head = document.createElement('thead');
  head.innerHTML = '<tr><th>Subject</th><th>Score</th></tr>';
  table.appendChild(head);
  const body = document.createElement('tbody');

  if (mine.length === 0) {
    const row = document.createElement('tr');
    const td = cell('No grades recorded yet.');
    td.colSpan = 2;
    row.appendChild(td);
    body.appendChild(row);
  } else {
    let total = 0;
    mine.forEach(function (g) {
      const row = document.createElement('tr');
      row.appendChild(cell(g.subject));
      row.appendChild(cell(g.score));
      body.appendChild(row);
      total += Number(g.score);
    });
    const avg = document.createElement('tr');
    const label = cell('Average');
    label.style.fontWeight = 'bold';
    avg.appendChild(label);
    avg.appendChild(cell((total / mine.length).toFixed(1)));
    body.appendChild(avg);
  }
  table.appendChild(body);
  reportCard.appendChild(table);
}

generateXmlBtn.addEventListener('click', generateXML);
subjectSelect.addEventListener('change', renderGradeTable);
reportStudent.addEventListener('change', renderReportCard);

loadTable();
loadSubjects();
loadReportStudents();
