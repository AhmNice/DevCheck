import UserInterface from "../interface/user.interface.js";
import bcrypt from "bcrypt";
import { APIError, BadRequestError } from "../utils/errorHandler.js";
import prisma from "../config/database.js";
import type { Prisma, User as PrismaUser } from "../generated/prisma/client.js";
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

type UserDefaultSanitized = Omit<
  UserInterface,
  | "password"
  | "otp"
  | "otp_expiry"
  | "resetPassword_token"
  | "resetPassword_token_expiry"
>;

type UserWithoutGithubIntegration = Omit<
  UserDefaultSanitized,
  | "github_access_token"
  | "github_connected"
  | "github_connected_at"
  | "github_username"
  | "github_profile_url"
  | "github_avatar_url"
>;

type UserWithOtp = Omit<UserDefaultSanitized, "github_access_token"> &
  Pick<UserInterface, "otp" | "otp_expiry">;

type UserWithPassword = Omit<UserDefaultSanitized, "github_access_token"> &
  Pick<UserInterface, "password">;

type UserWithResetPasswordToken = UserDefaultSanitized &
  Pick<UserInterface, "resetPassword_token" | "resetPassword_token_expiry">;

export class User implements UserType {
  name!: string;
  email!: string;
  password!: string;
  account_role!: "USER" | "ADMIN";
  google_id!: string | null;
  profile_picture!: string;
  github_id!: string | null;
  otp?: string | null;
  otp_expiry?: Date | null | undefined;
  github_access_token?: string | null;
  github_connected?: boolean | null;
  github_connected_at?: Date | null;
  github_username?: string | null;
  github_profile_url?: string | null;
  github_avatar_url?: string | null;
  constructor(parameters: UserType) {
    Object.assign(this, parameters);
  }

  private static toAccountRole(
    role: UserInterface["account_role"],
  ): "USER" | "ADMIN" {
    return role === "ADMIN" ? "ADMIN" : "USER";
  }

  private static fromAccountRole(
    role: PrismaUser["accountRole"],
  ): UserInterface["account_role"] {
    return role === "ADMIN" ? "ADMIN" : "USER";
  }

  private static toLegacyUser(user: PrismaUser): UserInterface {
    return {
      _id: user.id,
      google_id: user.googleId,
      github_id: user.githubId,
      github_username: user.githubUsername,
      github_profile_url: user.githubProfileUrl,
      github_avatar_url: user.githubAvatarUrl,
      github_connected: user.githubConnected,
      github_connected_at: user.githubConnectedAt,
      name: user.name,
      email: user.email,
      password: user.password,
      bio: user.bio || "",
      profile_picture: user.profilePicture || "",
      account_role: User.fromAccountRole(user.accountRole),
      otp: user.otp,
      otp_expiry: user.otpExpiry,
      is_verified: user.isVerified,
      github_access_token: user.githubAccessToken,
      resetPassword_token: user.resetPasswordToken,
      resetPassword_token_expiry: user.resetPasswordExpiry,
      job_role: user.jobTitle || "",
      created_at: user.createdAt,
      updated_at: user.updatedAt,
    };
  }

  private static buildUserUpdateData(
    updates: Partial<UserInterface>,
  ): Prisma.UserUpdateInput {
    const data: Prisma.UserUpdateInput = {};

    if (updates.name !== undefined) data.name = updates.name;
    if (updates.email !== undefined) data.email = updates.email;
    if (typeof updates.password === "string") data.password = updates.password;
    if (updates.account_role !== undefined) {
      data.accountRole = User.toAccountRole(updates.account_role);
    }
    if (updates.google_id !== undefined) data.googleId = updates.google_id;
    if (updates.profile_picture !== undefined) {
      data.profilePicture = updates.profile_picture;
    }
    if (updates.github_id !== undefined) data.githubId = updates.github_id;
    if (updates.otp !== undefined) data.otp = updates.otp;
    if (updates.otp_expiry !== undefined) data.otpExpiry = updates.otp_expiry;
    if (updates.github_access_token !== undefined) {
      data.githubAccessToken = updates.github_access_token;
    }
    if (updates.is_verified !== undefined)
      data.isVerified = updates.is_verified;
    if (updates.resetPassword_token !== undefined) {
      data.resetPasswordToken = updates.resetPassword_token;
    }
    if (updates.resetPassword_token_expiry !== undefined) {
      data.resetPasswordExpiry = updates.resetPassword_token_expiry;
    }
    if (updates.bio !== undefined) data.bio = updates.bio;
    if (updates.job_role !== undefined) data.jobTitle = updates.job_role;

    return data;
  }

  private static buildGithubUpdateData(
    updates: Partial<UserInterface>,
  ): Prisma.UserUpdateInput {
    const data: Prisma.UserUpdateInput = {};

    if (updates.github_id !== undefined) data.githubId = updates.github_id;
    if (updates.github_username !== undefined) {
      data.githubUsername = updates.github_username;
    }
    if (updates.github_profile_url !== undefined) {
      data.githubProfileUrl = updates.github_profile_url;
    }
    if (updates.github_avatar_url !== undefined) {
      data.githubAvatarUrl = updates.github_avatar_url;
    }
    if (updates.github_access_token !== undefined) {
      data.githubAccessToken = updates.github_access_token;
    }
    if (updates.github_connected !== undefined) {
      data.githubConnected = Boolean(updates.github_connected);
    }
    if (updates.github_connected_at !== undefined) {
      data.githubConnectedAt = updates.github_connected_at;
    }

    return data;
  }

  private static sanitizeDefaultUser(
    user: UserInterface,
  ): UserDefaultSanitized {
    const {
      password: _password,
      otp: _otp,
      otp_expiry: _otp_expiry,
      resetPassword_token: _resetPassword_token,
      resetPassword_token_expiry: _resetPassword_token_expiry,
      ...safeUser
    } = user;
    return safeUser;
  }

  private static sanitizeUserWithoutGithubIntegration(
    user: UserInterface,
  ): UserWithoutGithubIntegration {
    const {
      github_access_token: _github_access_token,
      github_connected: _github_connected,
      github_connected_at: _github_connected_at,
      github_username: _github_username,
      github_profile_url: _github_profile_url,
      github_avatar_url: _github_avatar_url,
      ...safeUser
    } = User.sanitizeDefaultUser(user);
    return safeUser;
  }

  private static sanitizeUserWithOtp(user: UserInterface): UserWithOtp {
    const defaultSafe = User.sanitizeDefaultUser(user);
    const { github_access_token: _github_access_token, ...safeUser } =
      defaultSafe;
    return {
      ...safeUser,
      otp: user.otp,
      otp_expiry: user.otp_expiry,
    };
  }

  private static sanitizeUserWithPassword(
    user: UserInterface,
  ): UserWithPassword {
    const defaultSafe = User.sanitizeDefaultUser(user);
    const { github_access_token: _github_access_token, ...safeUser } =
      defaultSafe;
    return {
      ...safeUser,
      password: user.password,
    };
  }

  private static sanitizeUserWithResetPasswordToken(
    user: UserInterface,
  ): UserWithResetPasswordToken {
    return {
      ...User.sanitizeDefaultUser(user),
      resetPassword_token: user.resetPassword_token,
      resetPassword_token_expiry: user.resetPassword_token_expiry,
    };
  }

  async save(): Promise<UserDefaultSanitized> {
    const passwordHash = await bcrypt.hash(this.password, 10);
    let result;
    try {
      result = await prisma.user.create({
        data: {
          name: this.name,
          email: this.email,
          password: passwordHash,
          accountRole: User.toAccountRole(this.account_role),
          googleId: this.google_id,
          profilePicture: this.profile_picture,
          githubId: this.github_id,
          otp: this.otp,
          otpExpiry: this.otp_expiry,
        },
      });
    } catch (error) {
      throw new BadRequestError({
        message: "Error saving user: " + (error as Error).message,
      });
    }
    return User.sanitizeDefaultUser(User.toLegacyUser(result));
  }
  static async findById(user_id: string): Promise<UserDefaultSanitized | null> {
    try {
      const result = await prisma.user.findUnique({
        where: { id: user_id },
      });
      if (!result) {
        return null;
      }
      return User.sanitizeDefaultUser(User.toLegacyUser(result));
    } catch (error) {
      throw new BadRequestError({
        message: "Error finding user: " + (error as Error).message,
      });
    }
  }
  static async findByGoogleId(
    googleId: string,
  ): Promise<UserDefaultSanitized | null> {
    try {
      const result = await prisma.user.findUnique({
        where: { googleId },
      });
      if (!result) {
        return null;
      }
      return User.sanitizeDefaultUser(User.toLegacyUser(result));
    } catch (error) {
      throw new BadRequestError({
        message: "Error finding user by Google ID: " + (error as Error).message,
      });
    }
  }
  static async findByGitHubId(
    githubId: string,
  ): Promise<UserDefaultSanitized | null> {
    try {
      const result = await prisma.user.findUnique({
        where: { githubId },
      });
      if (!result) {
        return null;
      }
      return User.sanitizeDefaultUser(User.toLegacyUser(result));
    } catch (error) {
      throw new APIError({
        message: "Error finding user by GitHub ID: " + (error as Error).message,
        statusCode: 500,
        errors: [],
        code: "FIND_USER_BY_GITHUB_ID_ERROR",
      });
    }
  }
  async googleSave(): Promise<UserDefaultSanitized> {
    try {
      const result = await prisma.user.create({
        data: {
          name: this.name,
          email: this.email,
          accountRole: User.toAccountRole(this.account_role),
          password: this.password,
          googleId: this.google_id,
          profilePicture: this.profile_picture,
          otp: this.otp,
          isVerified: true,
        },
      });
      return User.sanitizeDefaultUser(User.toLegacyUser(result));
    } catch (error) {
      throw new BadRequestError({
        message:
          "Error saving user with Google data: " + (error as Error).message,
      });
    }
  }
  async githubSave(): Promise<UserWithoutGithubIntegration> {
    try {
      const result = await prisma.user.create({
        data: {
          name: this.name,
          email: this.email,
          accountRole: User.toAccountRole(this.account_role),
          githubId: this.github_id,
          profilePicture: this.profile_picture,
          password: this.password,
          isVerified: true,
          githubAccessToken: this.github_access_token,
          githubConnected: this.github_connected || false,
          githubConnectedAt: this.github_connected_at,
          githubUsername: this.github_username,
          githubProfileUrl: this.github_profile_url,
          githubAvatarUrl: this.github_avatar_url,
        },
      });
      return User.sanitizeUserWithoutGithubIntegration(
        User.toLegacyUser(result),
      );
    } catch (error) {
      throw new BadRequestError({
        message:
          "Error saving user with GitHub data: " + (error as Error).message,
      });
    }
  }
  static async findByEmail(
    email: string,
  ): Promise<UserWithoutGithubIntegration | null> {
    try {
      const result = await prisma.user.findUnique({
        where: { email },
      });
      if (!result) {
        return null;
      }
      return User.sanitizeUserWithoutGithubIntegration(
        User.toLegacyUser(result),
      );
    } catch (error) {
      throw new BadRequestError({
        message: "Error finding user: " + (error as Error).message,
      });
    }
  }
  static async findByEmailWithOTP(email: string): Promise<UserWithOtp | null> {
    try {
      const result = await prisma.user.findUnique({
        where: { email },
      });
      if (!result) {
        return null;
      }
      return User.sanitizeUserWithOtp(User.toLegacyUser(result));
    } catch (error) {
      throw new BadRequestError({
        message: "Error finding user: " + (error as Error).message,
      });
    }
  }
  static async findByEmailWithPassword(
    email: string,
  ): Promise<UserWithPassword | null> {
    try {
      const result = await prisma.user.findUnique({
        where: { email },
      });
      if (!result) {
        return null;
      }
      return User.sanitizeUserWithPassword(User.toLegacyUser(result));
    } catch (error) {
      throw new BadRequestError({
        message: "Error finding user: " + (error as Error).message,
      });
    }
  }
  static async exists(email: string) {
    const user = await this.findByEmail(email);
    return !!user;
  }
  static async updateUserByEmail(
    email: string,
    updates: Partial<UserInterface>,
  ) {
    const data = User.buildUserUpdateData(updates);
    if (Object.keys(data).length === 0) {
      throw new BadRequestError({ message: "No fields to update" });
    }
    try {
      const result = await prisma.user.update({
        where: { email },
        data,
      });
      return User.toLegacyUser(result);
    } catch (error) {
      throw new BadRequestError({
        message: "Error updating user: " + (error as Error).message,
      });
    }
  }
  static async findByResetPasswordToken(
    token: string,
  ): Promise<UserWithResetPasswordToken | null> {
    try {
      const result = await prisma.user.findFirst({
        where: {
          resetPasswordToken: token,
          resetPasswordExpiry: { gt: new Date() },
        },
      });
      if (!result) {
        return null;
      }
      return User.sanitizeUserWithResetPasswordToken(User.toLegacyUser(result));
    } catch (error) {
      throw new BadRequestError({
        message:
          "Error finding user by reset password token: " +
          (error as Error).message,
      });
    }
  }
  static async updateUserById(
    user_id: string,
    updates: Partial<UserInterface>,
  ) {
    const data = User.buildUserUpdateData(updates);
    if (Object.keys(data).length === 0) {
      throw new BadRequestError({ message: "No fields to update" });
    }
    try {
      const result = await prisma.user.update({
        where: { id: user_id },
        data,
      });
      return User.toLegacyUser(result);
    } catch (error) {
      throw new BadRequestError({
        message: "Error updating user: " + (error as Error).message,
      });
    }
  }
  static async updateGithubUserById(
    user_id: string,
    updates: Partial<UserInterface>,
  ) {
    const data = User.buildGithubUpdateData(updates);
    if (Object.keys(data).length === 0) {
      throw new BadRequestError({ message: "No fields to update" });
    }
    try {
      const result = await prisma.user.update({
        where: { id: user_id },
        data,
      });
      return User.toLegacyUser(result);
    } catch (error) {
      throw new BadRequestError({
        message: "Error updating GitHub user: " + (error as Error).message,
      });
    }
  }
}
