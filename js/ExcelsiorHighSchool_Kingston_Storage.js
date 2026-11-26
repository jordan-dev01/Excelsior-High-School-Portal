// Shared storage + authentication helpers (loaded by every page that needs data or a login check).
// Only function declarations live here so page scripts can use their own const names freely.

const LOGIN_PAGE = 'ExcelsiorHighSchool_Kingston_Login.html';
const SEED_VERSION = '2';

// Read an array/object from localStorage (returns [] if missing or corrupted).
function getData(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value === null || value === undefined ? [] : value;
  } catch (err) {
    return [];
  }
}

// Save any value to localStorage under the given key.
function saveData(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// 1. Creates the default Admin / Teacher accounts and the subject list.
function seedDatabase() {
  if (localStorage.getItem('seedVersion') === SEED_VERSION) return;

  saveData('users', [
    { username: 'admin', password: 'admin123', role: 'admin', name: 'School Administrator', ID: 'A001' },
    {
      username: 'teacher',
      password: 'teacher123',
      role: 'teacher',
      name: 'Demo Teacher',
      ID: 'T001',
      subjects: ['Mathematics', 'English Language', 'Information Technology', 'Integrated Science']
    }
  ]);

  saveData('subjects', [
    { code: 'MATH', name: 'Mathematics' },
    { code: 'ENG', name: 'English Language' },
    { code: 'IT', name: 'Information Technology' },
    { code: 'SCI', name: 'Integrated Science' },
    { code: 'SOC', name: 'Social Studies' }
  ]);

  localStorage.setItem('seedVersion', SEED_VERSION);
}

// 2. Checks the username/password and remembers who logged in.
function login(username, password) {
  const users = getData('users');
  const user = users.find(function (u) {
    return u.username === username && u.password === password;
  });

  if (!user) {
    return { success: false, message: 'Invalid username or password.' };
  }

  // Never keep the password in the "current user" record.
  const safeUser = Object.assign({}, user);
  delete safeUser.password;
  saveData('currentUser', safeUser);
  return { success: true, user: safeUser };
}

// Returns the logged-in user, or null.
function getCurrentUser() {
  const user = getData('currentUser');
  return user && user.role ? user : null;
}

// 3. Blocks pages for anyone who is not logged in with an allowed role.
//    Accepts one role ('admin') or a list (['admin', 'teacher']).
function requireRole(roles) {
  const allowed = Array.isArray(roles) ? roles : [roles];
  const user = getCurrentUser();

  if (!user || allowed.indexOf(user.role) === -1) {
    // Hide the page immediately so nothing private flashes before the redirect.
    document.documentElement.style.display = 'none';
    window.location.replace(LOGIN_PAGE);
    return false;
  }
  return true;
}

// 4. Logs the user out and sends them back to the login page.
function logout() {
  localStorage.removeItem('currentUser');
  window.location.href = LOGIN_PAGE;
}

// Make sure the default data exists no matter which page is opened first.
seedDatabase();
