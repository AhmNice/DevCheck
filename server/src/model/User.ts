import { pool } from "../config/db.config.js";
import UserInterface from "../interface/user.interface.js";

type UserType = Pick<
  UserInterface,
  "name" | "email" | "password" | "account_role"
>;
export class User implements UserType {
  name!: string;
  email!: string;
  password!: string;
  account_role!: "user" | "admin";

  constructor(parameters: UserType) {
    Object.assign(this, parameters);
  }

  async save() {
    const query = `
      INSERT INTO core.users (name, email, password, account_role)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const values = [this.name, this.email, this.password, this.account_role];

    const result = await pool.query(query, values);
    return result.rows[0];
  }
}
