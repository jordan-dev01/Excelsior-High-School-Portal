/* Group Members:
   Khaleed Bryan | 2408864 | Lab Thursday 6-8PM
   Yashen Barracks | 2304973 | Lab Thursday 6-8PM
   Jordan Zhang | 2510220 | Lab Thursday 6-8PM
   Joel Nicholson | 2405543 | Lab Thursday 6-8PM
*/

 document
  .getElementById('loginForm')
  .addEventListener('submit', function (event) {
    // 1. STOP the form from refreshing the page//
    event.preventDefault();

    //* 2. Get what the user typed//
    const username = document.getElementById('usernameInput').value;
    const password = document.getElementById('passwordInput').value;

    // 3. Run the login function//
    const result = login(username, password);

    // 4. If login failed, show an error//
    if (!result.success) {
      document.getElementById('loginError').textContent = result.message;
      return;
    }

    // 5. If login worked, redirect based on their ROLE//
    if (result.user.role === 'admin') {
      window.location.href = 'ExcelsiorHighSchool_Kingston_Admin.html';
    } else if (result.user.role === 'teacher') {
      window.location.href = 'ExcelsiorHighSchool_Kingston_TeacherPanel.html';
    }
  });
