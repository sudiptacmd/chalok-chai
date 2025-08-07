import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      type: "owner" | "driver" | "admin";
      profilePhoto?: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    type: "owner" | "driver" | "admin";
    profilePhoto?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    type: "owner" | "driver" | "admin";
    profilePhoto?: string;
  }
}
