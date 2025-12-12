"use server"

import { headers } from "next/headers";
import { auth } from "./auth";
import { redirect } from "next/navigation";
import prisma from "./db";
import { authClient } from "./auth-client";
import { toast } from "sonner";


const authSession = async () => {
  const session = auth.api.getSession({ headers: await headers() });
  return session;
};

export const requireAuth = async () => {
  const session = await authSession();

  if (!session) {
    redirect("/sign-in");
  }

  return session;
};

export const requireAdminAuth = async () => {
  const session = await authSession();
  if (!session) {
    redirect("/sign-in");
  }

  const roles = session.user.role ?? [];

  if (!roles.includes("ADMIN")) {
    redirect("/unauthorized"); 
  }

  return session;
};

export const requireNoAuth = async () => {
  const session = await authSession();

  if (session) {
  }
  return session;
};

export const findUserRole = async (userid: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userid },
  });

  return user ? [user.role] : null;
};

export const signout = async () => {
  try {
    console.log("SIgning out")
    await authClient.signOut();
    toast.success("Logged out succesfully")
  } catch (error) {}
};
