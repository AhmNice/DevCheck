import passport from "passport";
import { Strategy as GitHubStrategy, Profile } from "passport-github2";
import { BadRequestError } from "../utils/errorHandler.js";
import { User } from "../model/User.js";
import UserInterface from "../interface/user.interface.js";
import { generateRandomPassword } from "../utils/codeGenerator.js";
import bcrypt from "bcrypt";
import axios from "axios";

type UserType = Pick<
  UserInterface,
  | "name"
  | "email"
  | "password"
  | "account_role"
  | "google_id"
  | "profile_picture"
  | "github_id"
  | "is_verified"
  | "github_access_token"
>;

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      callbackURL: `${process.env.SERVER_URL}/api/auth/github/callback`,
      scope: ["read:user", "user:email"],
    },
    async (
      accessToken: string,
      _refreshToken: string,
      profile: Profile,
      done: (err: Error | null, user?: unknown) => void,
    ) => {
      try {
        console.log("GitHub profile:", profile);
        let email = profile.emails?.[0]?.value;
        // If email not in profile → fetch from GitHub API
        if (!email) {
          const response = await axios.get(
            "https://api.github.com/user/emails",
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            },
          );

          const primaryEmail = response.data.find(
            (e: { primary: boolean; verified: boolean }) =>
              e.primary && e.verified,
          );

          email = primaryEmail?.email;
        }

        if (!email) {
          return done(
            new BadRequestError("We couldn't access your GitHub email."),
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
          account_role: "user",
          google_id: null,
          is_verified: true,
          github_access_token: accessToken,
        };

        let existingUser = await User.findByGitHubId(profile.id);
        console.log(user);
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
