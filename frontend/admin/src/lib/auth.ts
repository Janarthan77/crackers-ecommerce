import Cookies from 'js-cookie';

export interface AdminUser {
  id: number;
  username: string;
}

export function getAdminUser(): AdminUser {
  if (typeof window !== 'undefined') {
    const fromCookie = Cookies.get('admin_user');
    if (fromCookie) {
      try {
        return JSON.parse(fromCookie);
      } catch (e) {}
    }
    const fromStorage = localStorage.getItem('admin_user');
    if (fromStorage) {
      try {
        return JSON.parse(fromStorage);
      } catch (e) {}
    }
  }
  return { id: 1, username: 'rrvcrackers' };
}

export function setAdminUser(user: AdminUser) {
  Cookies.set('admin_user', JSON.stringify(user), { expires: 1 });
  if (typeof window !== 'undefined') {
    localStorage.setItem('admin_user', JSON.stringify(user));
  }
}

export function clearAdminUser() {
  Cookies.remove('admin-token');
  Cookies.remove('admin_user');
  if (typeof window !== 'undefined') {
    localStorage.removeItem('admin_user');
  }
}
