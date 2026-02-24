import passport from "passport";
import { Strategy as GitHubStrategy, Profile } from "passport-github2";
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
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      callbackURL: `${process.env.SERVER_URL}/api/auth/github/callback`,
      scope: ["user:email"],
    },
    async (accessToken, refreshToken, profile: Profile, done) => {
      try {
        console.log("GitHub profile:", profile);

        const email =
          profile.emails?.find((e) => e.primary && e.verified)?.value ||
          profile._json.email;
        console.log("Extracted email:", email);
        if (!email) {
          return done(
            new BadRequestError(
              "We couldn't access your GitHub email. Make sure it's public or allow email access.",
            ),
          );
        }

        const randomPassword = generateRandomPassword();
        const passwordHash = await bcrypt.hash(randomPassword, 10);

        const user: UserType = {
          github_id: profile.id,
          name: profile.displayName || profile.username || "Unknown",
          email,
          profile_picture: profile.photos?.[0]?.value || "",
          password: passwordHash,
          account_role: "user" as const,
          google_id: null,
        };

        let existingUser = await User.findByGitHubId(profile.id);
        if (!existingUser) {
          const newUser = new User(user);
          existingUser = await newUser.githubSave();
        }

        done(null, existingUser);
      } catch (error) {
        console.error("GitHub OAuth error:", error);
        return done(new BadRequestError("Github authentication failed"));
      }
    },
  ),
);

console.log("Github OAuth strategy configured");
console.log("Github OAuth strategy configured");
