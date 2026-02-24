import passport from "passport";
import { Strategy as GitHubStrategy, Profile } from "passport-google-oauth20";
import { BadRequestError } from "../utils/errorHandler.js";
import { User } from "../model/User.js";
import UserInterface from "../interface/user.interface.js";

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
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      callbackURL: `${process.env.SERVER_URL}/api/auth/github/callback`,
      scope: ["user:email"],
    },
    async (accessToken, refreshToken, profile: Profile, done) => {
      try {
        const email = profile.emails?.[0].value;
        if (!email) {
          throw new BadRequestError("GitHub account does not have an email");
        }
        const user: UserType = {
          github_id: profile.id,
          name: profile.displayName || profile.username!,
          email: email,
          profile_picture: profile.photos?.[0].value || "",
          password: null,
          account_role: "user",
          google_id: null,
        };
        const existingUser = await User.findByGitHubId(profile.id);
        if (!existingUser) {
          const newUser = new User(user);
          await newUser.githubSave();
        }
        done(null, user);
      } catch (error) {
        done(error, undefined);
        throw new BadRequestError("Github authentication failed");
      }
    },
  ),
);
