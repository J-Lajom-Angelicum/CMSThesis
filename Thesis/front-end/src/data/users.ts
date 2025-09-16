export interface UserType {
  id?: number; // optional, DB will auto-generate
  username: string;
  password: string;
  name: string;
  email: string;
  contactNo?: string;
  roleId: 1 | 2 | 3;
  role: "ADMIN" | "DOCTOR" | "STAFF";
  isActive: boolean;
}

export const users: UserType[] = [
  {
    id: 1,
    username: "admin",
    password: "admin123",
    name: "Julius Lajom",
    email: "juliuslajom.admin@gmail.com",
    contactNo: "09171234567",
    roleId: 3,
    role: "ADMIN",
    isActive: true,
  },
  {
    id: 2,
    username: "doctor1",
    password: "doctor123",
    name: "Dr. John Doe",
    email: "doctor1@gmail.com",
    contactNo: "09170000001",
    roleId: 1,
    role: "DOCTOR",
    isActive: true,
  },
  {
    id: 3,
    username: "staff1",
    password: "staff123",
    name: "Jane Smith",
    email: "staff1@gmail.com",
    contactNo: "09170000002",
    roleId: 2,
    role: "STAFF",
    isActive: true,
  },
];
