"use client";

import { apiRequest } from "@/lib/api/client";
import { withCompanyScope } from "@/lib/api/company-scope";
import type { User } from "@/types/user";

export function getUsers(companyId?: number) {
  return apiRequest<User[]>(withCompanyScope("/users", companyId));
}

export function createUser(payload: { name: string; email: string; password: string; role: string }, companyId?: number) {
  return apiRequest<User>(withCompanyScope("/users", companyId), {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function deleteUser(userId: number, companyId?: number) {
  return apiRequest<void>(withCompanyScope(`/users/${userId}`, companyId), {
    method: "DELETE"
  });
}
