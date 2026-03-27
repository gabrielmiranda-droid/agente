import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { TOKEN_COOKIE } from "@/lib/constants/app";

export default async function HomePage() {
  const token = (await cookies()).get(TOKEN_COOKIE)?.value;
  redirect(token ? "/dashboard" : "/login");
}

