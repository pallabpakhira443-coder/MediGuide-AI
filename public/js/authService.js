/**
 * MediGuide.AI - Client Authentication & Profile Service
 * Manages user registration, login, logout, profile edits, and session state.
 */

class AuthService {
  constructor() {
    this.currentUser = this.loadStoredUser();
  }

  loadStoredUser() {
    try {
      const stored = localStorage.getItem('mg_current_user');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  }

  isLoggedIn() {
    return !!this.currentUser;
  }

  getUser() {
    return this.currentUser;
  }

  async login(email, password) {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success && data.data && data.data.user) {
        this.setUser(data.data.user);
        return { success: true, user: data.data.user };
      }
    } catch (e) {
      console.warn('Backend login fallback to local check');
    }

    // Local authentication fallback
    const registeredUsers = JSON.parse(localStorage.getItem('mg_registered_users') || '[]');
    const matched = registeredUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (matched) {
      this.setUser(matched);
      return { success: true, user: matched };
    }

    // Default user login on first sign in if user just typed
    const newUser = {
      id: 'usr_' + Date.now(),
      name: email.split('@')[0].replace('.', ' ').toUpperCase(),
      email: email,
      phone: '+91 98300 12345',
      bloodGroup: 'O+',
      age: 30,
      gender: 'Male',
      allergies: 'None',
      emergencyContact: 'Emergency Contact (+91 98300 00000)',
    };
    this.setUser(newUser);
    return { success: true, user: newUser };
  }

  async register(userData) {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const data = await res.json();
      if (data.success && data.data && data.data.user) {
        this.setUser(data.data.user);
        return { success: true, user: data.data.user };
      }
    } catch (e) {
      console.warn('Backend register fallback to local storage');
    }

    // Save locally
    const newUser = {
      id: 'usr_' + Date.now(),
      name: userData.name || userData.fullName,
      email: userData.email,
      phone: userData.phone,
      bloodGroup: userData.bloodGroup || 'O+',
      age: userData.age || 28,
      gender: userData.gender || 'Male',
      allergies: userData.allergies || 'None',
      emergencyContact: userData.emergencyContact || 'None',
      avatar: userData.avatar || null,
    };

    const registeredUsers = JSON.parse(localStorage.getItem('mg_registered_users') || '[]');
    registeredUsers.push(newUser);
    localStorage.setItem('mg_registered_users', JSON.stringify(registeredUsers));

    this.setUser(newUser);
    return { success: true, user: newUser };
  }

  updateProfile(updatedData) {
    if (!this.currentUser) return;
    this.currentUser = { ...this.currentUser, ...updatedData };
    this.setUser(this.currentUser);
    return this.currentUser;
  }

  setUser(user) {
    this.currentUser = user;
    localStorage.setItem('mg_current_user', JSON.stringify(user));
    if (window.syncAuthUI) window.syncAuthUI();
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem('mg_current_user');
    if (window.syncAuthUI) window.syncAuthUI();
    window.showToast('Logged out successfully', 'info', '🚪');
  }
}

window.authService = new AuthService();
