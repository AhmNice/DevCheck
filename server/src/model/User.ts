import { pool } from "../config/db.config.js";
import UserInterface from "../interface/user.interface.js";
import bcrypt from "bcrypt";
import { BadRequestError } from "../utils/errorHandler.js";
type UserType = Pick<
  UserInterface,
  | "name"
  | "email"
  | "password"
  | "account_role"
  | "google_id"
  | "profile_picture"
  | "github_id"
  | "otp"
  | "otp_expiry"
  | "github_access_token"
>;
export class User implements UserType {
  name!: string;
  email!: string;
  password!: string;
  account_role!: "user" | "admin";
  google_id!: string | null;
  profile_picture!: string;
  github_id!: string | null;
  otp?: string | null;
  otp_expiry?: Date | null | undefined;
  github_access_token?: string | null;
  constructor(parameters: UserType) {
    Object.assign(this, parameters);
  }

  async save() {
    const passwordHash = await bcrypt.hash(this.password, 10);
    const query = `
      INSERT INTO core.users (name, email, password, account_role, google_id, profile_picture, github_id, otp, otp_expiry)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    const values = [
      this.name,
      this.email,
      passwordHash,
      this.account_role,
      this.google_id,
      this.profile_picture,
      this.github_id,
      this.otp,
      this.otp_expiry,
    ];
    let result;
    try {
      result = await pool.query(query, values);
    } catch (error) {
      throw new BadRequestError(
        "Error saving user: " + (error as Error).message,
      );
    }
    console.log("Saved user:", result.rows[0]);
    const {
      password: _password,
      otp: _otp,
      otp_expiry: _otp_expiry,
      resetPassword_token: _resetPassword_token,
      resetPassword_token_expiry: _resetPassword_token_expiry,
      ...cleanedUser
    } = result.rows[0];
    return cleanedUser;
  }
  static async findById(user_id: string) {
    const query = `SELECT * FROM core.users WHERE _id = $1`;
    let result;
    try {
      result = await pool.query(query, [user_id]);
      if (!result.rows.length) {
        return null;
      }
      const {
        password: _password,
        otp: _otp,
        otp_expiry: _otp_expiry,
        resetPassword_token: _resetPassword_token,
        resetPassword_token_expiry: _resetPassword_token_expiry,
        ...cleanedUser
      } = result.rows[0];
      return cleanedUser;
    } catch (error) {
      throw new BadRequestError(
        "Error finding user: " + (error as Error).message,
      );
    }
  }
  static async findByGoogleId(googleId: string) {
    const query = `
      SELECT * FROM core.users WHERE google_id = $1
    `;
    let result;
    try {
      result = await pool.query(query, [googleId]);
      if (!result.rows.length) {
        return null;
      }
      const {
        password: _password,
        otp: _otp,
        otp_expiry: _otp_expiry,
        resetPassword_token: _resetPassword_token,
        resetPassword_token_expiry: _resetPassword_token_expiry,
        ...cleanedUser
      } = result.rows[0];
      return cleanedUser;
    } catch (error) {
      throw new BadRequestError(
        "Error finding user by Google ID: " + (error as Error).message,
      );
    }
  }
  static async findByGitHubId(githubId: string) {
    const query = `
      SELECT * FROM core.users WHERE github_id = $1
    `;
    let result;
    try {
      result = await pool.query(query, [githubId]);
      if (!result.rows.length) {
        return null;
      }
      const {
        password: _password,
        otp: _otp,
        otp_expiry: _otp_expiry,
        resetPassword_token: _resetPassword_token,
        resetPassword_token_expiry: _resetPassword_token_expiry,
        ...cleanedUser
      } = result.rows[0];
      return cleanedUser;
    } catch (error) {
      throw new BadRequestError(
        "Error finding user by GitHub ID: " + (error as Error).message,
      );
    }
  }
  async googleSave() {
    const query = `
      INSERT INTO core.users (name, email, account_role, password, google_id, profile_picture, otp, is_verified)
      VALUES ($1, $2, $3, $4, $5, $6, $7, true)
      RETURNING *
    `;
    const values = [
      this.name,
      this.email,
      this.account_role,
      this.password,
      this.google_id,
      this.profile_picture,
      this.otp,
    ];
    let result;
    try {
      result = await pool.query(query, values);
    } catch (error) {
      throw new BadRequestError(
        "Error saving user with Google data: " + (error as Error).message,
      );
    }
    console.log("Saved user with Google data:", result.rows[0]);
    const {
      password: _password,
      otp: _otp,
      otp_expiry: _otp_expiry,
      resetPassword_token: _resetPassword_token,
      resetPassword_token_expiry: _resetPassword_token_expiry,
      ...cleanedUser
    } = result.rows[0];
    return cleanedUser;
  }
  async githubSave() {
    const query = `
      INSERT INTO core.users (name, email, account_role, github_id, profile_picture, password, is_verified, github_access_token)
      VALUES ($1, $2, $3, $4, $5, $6, true, $7)
      RETURNING *
    `;
    const values = [
      this.name,
      this.email,
      this.account_role,
      this.github_id,
      this.profile_picture,
      this.password,
      this.github_access_token,
    ];
    let result;
    try {
      result = await pool.query(query, values);
    } catch (error) {
      throw new BadRequestError(
        "Error saving user with GitHub data: " + (error as Error).message,
      );
    }
    console.log("Saved user with GitHub data:", result.rows[0]);
    const {
      password: _password,
      otp: _otp,
      otp_expiry: _otp_expiry,
      resetPassword_token: _resetPassword_token,
      resetPassword_token_expiry: _resetPassword_token_expiry,
      ...cleanedUser
    } = result.rows[0];
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
    if (!result.rows.length) {
      return null;
    }
    const {
      password: _password,
      otp: _otp,
      otp_expiry: _otp_expiry,
      resetPassword_token: _resetPassword_token,
      resetPassword_token_expiry: _resetPassword_token_expiry,
      ...cleanedUser
    } = result.rows[0];
    return cleanedUser;
  }
  static async findByEmailWithOTP(email: string) {
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
    if (!result.rows.length) {
      return null;
    }
    const {
      password: _password,
      otp_expiry: _otp_expiry,
      resetPassword_token: _resetPassword_token,
      resetPassword_token_expiry: _resetPassword_token_expiry,
      ...cleanedUser
    } = result.rows[0];
    return cleanedUser;
  }
  static async findByEmailWithPassword(email: string) {
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
    if (!result.rows.length) {
      return null;
    }
    const {
      otp: _otp,
      otp_expiry: _otp_expiry,
      resetPassword_token: _resetPassword_token,
      resetPassword_token_expiry: _resetPassword_token_expiry,
      ...cleanedUser
    } = result.rows[0];
    return cleanedUser;
  }
  static async exists(email: string) {
    const user = await this.findByEmail(email);
    return !!user;
  }
  static async updateUserByEmail(
    email: string,
    updates: Partial<UserInterface>,
  ) {
    const fields = [];
    const values = [];
    let index = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        fields.push(`${key} = $${index}`);
        values.push(value);
        index++;
      }
    }
    if (fields.length === 0) {
      throw new BadRequestError("No fields to update");
    }
    const query = `UPDATE core.users SET ${fields.join(", ")} WHERE email = $${index}`;
    values.push(email);
    let result;
    try {
      result = await pool.query(query, values);
    } catch (error) {
      throw new BadRequestError(
        "Error updating user: " + (error as Error).message,
      );
    }
    return result.rows[0];
  }
  static async findByResetPasswordToken(token: string) {
    const query = `
      SELECT * FROM core.users WHERE resetPassword_token = $1 AND resetPassword_token_expiry > NOW()
    `;
    let result;
    try {
      result = await pool.query(query, [token]);
    } catch (error) {
      throw new BadRequestError(
        "Error finding user by reset password token: " +
          (error as Error).message,
      );
    }
    if (!result.rows.length) {
      return null;
    }
    const {
      password: _password,
      otp: _otp,
      otp_expiry: _otp_expiry,
      resetPassword_token: _resetPassword_token,
      resetPassword_token_expiry: _resetPassword_token_expiry,
      ...cleanedUser
    } = result.rows[0];
    return cleanedUser;
  }
  static async updateUserById(
    user_id: string,
    updates: Partial<UserInterface>,
  ) {
    const fields = [];
    const values = [];
    let index = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        fields.push(`${key} = $${index}`);
        values.push(value);
        index++;
      }
    }
    if (fields.length === 0) {
      throw new BadRequestError("No fields to update");
    }
    const query = `UPDATE core.users SET ${fields.join(", ")} WHERE user_id = $${index}`;
    values.push(user_id);
    let result;
    try {
      result = await pool.query(query, values);
    } catch (error) {
      throw new BadRequestError(
        "Error updating user: " + (error as Error).message,
      );
    }
    return result.rows[0];
  }
}
