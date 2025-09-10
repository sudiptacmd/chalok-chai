import { Suspense } from "react";
import { SignInPage } from "@/components/signin-page";

export default function SignIn() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInPage />
    </Suspense>
  );
}
