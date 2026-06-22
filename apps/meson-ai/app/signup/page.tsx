import SignupClient from "./SignupClient";
import { getSignupState } from "@/lib/auth/signup";

export const dynamic = "force-dynamic";

export default async function SignupPage() {
  const state = await getSignupState();
  return <SignupClient initialState={state} />;
}
