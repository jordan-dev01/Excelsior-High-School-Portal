/* Group Members:
   Khaleed Bryan | 2408864 | Lab Thursday 6-8PM
   Yashen Barracks | 2304973 | Lab Thursday 6-8PM
   Jordan Zhang | 2510220 | Lab Thursday 6-8PM
   Joel Nicholson | 2405543 | Lab Thursday 6-8PM
*/
// Login page logic (needs Storage.js loaded first).
document.getElementById('loginForm').addEventListener('submit', function (event) {
  // Stop the form from refreshing the page
  event.preventDefault();

  const errorBox = document.getElementById('loginError');
  const username = document.getElementById('usernameInput').value.trim();
  const password = document.getElementById('passwordInput').value;

  const result = login(username, password);

  // Wrong details: show the error and stay here
  if (!result.success) {
    errorBox.textContent = result.message;
    errorBox.style.display = 'block';
    return;
  }

  // Right details: send each role to its own dashboard
  if (result.user.role === 'admin') {
    window.location.href = 'ExcelsiorHighSchool_Kingston_Admin.html';
  } else if (result.user.role === 'teacher') {
    window.location.href = 'ExcelsiorHighSchool_Kingston_TeacherPanel.html';
  } else {
    errorBox.textContent = 'No page has been set up for this role yet.';
    errorBox.style.display = 'block';
  }
});
