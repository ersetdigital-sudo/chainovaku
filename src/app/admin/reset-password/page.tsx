import type { Metadata } from "next";
import { ResetPasswordForm } from "@/modules/admin/components/auth/ResetPasswordForm";
import { LoginUnavailable } from "@/modules/admin/components/auth/LoginScreen";
import { getPublicBrand } from "@/modules/admin/data/auth";
import { adminEnvStatus } from "@/modules/admin/data/env";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Reset Password",
  robots: { index: false, follow: false },
};

export default async function ResetPasswordPage() {
  const status = adminEnvStatus();
  if (!status.configured) {
    return <LoginUnavailable missing={status.missing} brandMissing={false} />;
  }

  const brand = await getPublicBrand();
  return <ResetPasswordForm brand={brand} />;
}
