export interface User {
  id: string;
  email: string;
  phone: string;
  name: string;
  age: number | null;
  qualification: string | null;
  certifications: string[];
  profilePhoto: string | null;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

