/* Group Members:
   Khaleed Bryan | 2408864 | Lab Thursday 6-8PM
   Yashen Barracks | 2304973 | Lab Thursday 6-8PM
   Jordan Zhang | 2510220 | Lab Thursday 6-8PM
   Joel Nicholson | 2405543 | Lab Thursday 6-8PM
*/

// 1. This creates the default Admin and Teacher accounts so we can actually log in.
function seedDatabase() {
  const users = localStorage.getItem('users');
  
  // If the browser hasn't saved any users yet, we make these two accounts.
  if (!users) {
    const defaultUsers = [
      { username: 'admin', password: 'admin123', role: 'admin' },
      { username: 'teacher', password: 'teacher123', role: 'teacher' }
    ];
    localStorage.setItem('users', JSON.stringify(defaultUsers));
  }
}

// 2. This checks if the user typed the right username and password.
function login(username, password) {
  const users = JSON.parse(localStorage.getItem('users')) || [];
  
  // Look through the saved users to find a match.
  const user = users.find(u => u.username === username && u.password === password);
  
  if (user) {
    // Remember who just logged in so the next page knows who they are.
    localStorage.setItem('currentUser', JSON.stringify(user));
    return { success: true, user: user };
  } else {
    return { success: false, message: 'Invalid username or password.' };
  }
}

// 3. This stops people from just typing the page link to sneak into the Admin or Teacher pages.
function requireRole(role) {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  
  // If they aren't logged in, or they have the wrong role, kick them back to the login page.
  if (!currentUser || currentUser.role !== role) {
    alert('Access Denied. Please log in first.');
    window.location.href = 'ExcelsiorHighSchool_Kingston_Login.html';
  }
}

// 4. This logs the user out and sends them back to the login page.
function logout() {
  localStorage.removeItem('currentUser');
  window.location.href = 'ExcelsiorHighSchool_Kingston_Login.html';
}