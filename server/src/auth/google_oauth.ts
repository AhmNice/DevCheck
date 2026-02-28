import passport from "passport";
import { Strategy as googleStrategy, Profile } from "passport-google-oauth20";
import { BadRequestError } from "../utils/errorHandler.js";
import { User } from "../model/User.js";
import UserInterface from "../interface/user.interface.js";
import { generateRandomPassword } from "../utils/codeGenerator.js";
import bcrypt from "bcrypt";

type UserType = Pick<
  UserInterface,
  | "name"
  | "email"
  | "password"
  | "account_role"
  | "google_id"
  | "profile_picture"
  | "github_id"
>;

passport.use(
  new googleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: `${process.env.SERVER_URL}/api/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile: Profile, done) => {
      try {
        const email = profile.emails?.[0].value;
        if (!email) {
          return done(
            new BadRequestError("Google account does not have an email"),
          );
        }
        const randomPassword = generateRandomPassword();
        const passwordHash = await bcrypt.hash(randomPassword, 10);

        const user: UserType = {
          google_id: profile.id,
          name: profile.displayName,
          email: email,
          profile_picture: profile.photos?.[0].value || "",
          password: passwordHash,
          account_role: "user",
          github_id: null,
        };
        const userExists = await User.findByGoogleId(profile.id);
        if (!userExists) {
          const newUser = new User(user);
          await newUser.googleSave();
        }
        done(null, user);
      } catch (error) {
        console.error("DEBUG: Google Strategy Error:", error);
        done(error, undefined);
        return done(error as Error);
      }
    },
  ),
);
