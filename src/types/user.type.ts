interface User {
  name: string;
  email: string;
  password?: string;
  type: 'user' | 'admin' | 'subAdmin';
  isLoggedIn: boolean;
  lastLoginTime?: Date;
  lastLogoutTime?: Date;
}

export type { User };
