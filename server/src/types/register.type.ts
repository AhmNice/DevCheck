export type RegisterRequest = {
  name: string;
  email: string;
  password: string;
  account_role: "user" | "admin";
};
