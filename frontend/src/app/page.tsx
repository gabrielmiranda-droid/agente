import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { REFRESH_COOKIE, TOKEN_COOKIE } from "@/lib/constants/app";

export default async function HomePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_COOKIE)?.value;
  const refreshToken = cookieStore.get(REFRESH_COOKIE)?.value;

  redirect(token || refreshToken ? "/dashboard" : "/login");
}
