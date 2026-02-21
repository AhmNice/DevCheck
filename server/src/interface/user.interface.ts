export default interface UserInterface {
  id: number;
  name: string;
  email: string;
  password: string;
  bio: string;
  profilePicture: string;
  account_role: "user" | "admin";
  role: string;
  createdAt: Date;
  updatedAt: Date;
}
