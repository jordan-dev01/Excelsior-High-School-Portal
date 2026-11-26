/* Group Members:
   Khaleed Bryan | 2408864 | Lab Thursday 6-8PM
   Yashen Barracks | 2304973 | Lab Thursday 6-8PM
   Jordan Zhang | 2510220 | Lab Thursday 6-8PM
   Joel Nicholson | 2405543 | Lab Thursday 6-8PM
*/

// 1. Get the students from localStorage (same key used in admin.js)
const KEY = 'students';
let students = JSON.parse(localStorage.getItem(KEY)) || [];

// 2. Get the HTML elements we need to change
const tableBody = document.getElementById('teacherStudentTable');
const generateXmlBtn = document.getElementById('generateXmlBtn');
const xmlOutput = document.getElementById('xmlOutput');

// 3. Function to load the table
function loadTable() {
  // Clear the table body first
  tableBody.innerHTML = '';

  // If there are no students, show a message
  if (students.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No students found. Ask Admin to add some.</td></tr>';
    return;
  }

  // Loop through each student and create a row
  students.forEach((s) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${s.id}</td>
      <td>${s.firstName} ${s.lastName}</td>
      <td>${s.email}</td>
      <td>${s.gradeLevel}</td>
      <td>${s.semester}</td>
    `;
    tableBody.appendChild(row);
  });
}

// 4. Function to generate XML (Based on Unit 4 Lecture Notes)
function generateXML() {
  // XML declaration and tags, based on the Unit 4 lecture notes
  let xml = '<?xml version="1.0"?>\n';
  xml += '<students>\n';

  // Loop through students and create the simple XML tags
  students.forEach((s) => {
    xml += '  <student>\n';
    xml += `    <id>${s.id}</id>\n`;
    xml += `    <name>${s.firstName} ${s.lastName}</name>\n`;
    xml += `    <email>${s.email}</email>\n`;
    xml += '  </student>\n';
  });

  xml += '</students>';

  // Show the output on the screen
  xmlOutput.textContent = xml;
  xmlOutput.style.display = 'block'; 
}

// 5. Add click event to the button
generateXmlBtn.addEventListener('click', generateXML);

// 6. Load the table as soon as the page opens
loadTable();