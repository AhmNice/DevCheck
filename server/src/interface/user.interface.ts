export default interface UserInterface {
  id: number;
  name: string;
  email: string;
  password: string;
  bio: string;
  profile_picture: string;
  account_role: "user" | "admin";
  job_role: string;
  created_at: Date;
  updated_at: Date;
}
