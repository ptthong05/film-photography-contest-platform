/** Khớp với enum com.example.backend.enums.Role */
export type Role = 'ADMIN' | 'ORGANIZER' | 'JUDGE' | 'PARTICIPANT';

/** Khớp với UserResponse của backend */
export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

/** Khớp với UserRequest của backend */
export type UserRequest = Omit<User, 'id'>;
