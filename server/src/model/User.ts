import { pool } from "../config/db.config.js";
import UserInterface from "../interface/user.interface.js";
import bcrypt from "bcrypt";
import { BadRequestError } from "../utils/errorHandler.js";
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
    const passwordHash = await bcrypt.hash(this.password, 10);
    const query = `
      INSERT INTO core.users (name, email, password, account_role)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const values = [this.name, this.email, passwordHash, this.account_role];
    let result;
    try {
      result = await pool.query(query, values);
    } catch (error) {
      throw new BadRequestError(
        "Error saving user: " + (error as Error).message,
      );
    }
    const { password: _password, ...cleanedUser } = result.rows[0];
    return cleanedUser;
  }

  static async findByEmail(email: string) {
    const query = `
      SELECT * FROM core.users WHERE email = $1
    `;
    let result;
    try {
      result = await pool.query(query, [email]);
    } catch (error) {
      throw new BadRequestError(
        "Error finding user: " + (error as Error).message,
      );
    }
    const { password: _password, ...cleanedUser } = result.rows[0];
    return cleanedUser;
  }

  static async exists(email: string) {
    const user = await this.findByEmail(email);
    return !!user;
  }
}
