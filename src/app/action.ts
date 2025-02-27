"use server";

import { auth } from "~/server/auth";
import { db, localsSession } from "~/server/db";

export async function DeleteOrigin(formData: FormData) {
  //   const name = formData.get("name");
  const session = await auth();
  if (!session) {
    throw new Error("Not authenticated");
  }
  await db.allowedOrigin.delete({
    where: {
      id: formData.get("origin")!.toString(),
      AND: {
        userId: session.user.id,
      },
    },
  });

  return { success: true };
}
export async function AddOrigin(formData: FormData) {
  const session = await auth();
  if (!session) {
    throw new Error("Not authenticated");
  }
  await db.allowedOrigin.create({
    data: {
      origin: formData.get("origin")!.toString(),
      userId: session.user.id,
    },
  });
  return { success: true };
}
export async function DeleteSession(formData: FormData) {
  const session = await auth();
  if (!session) {
    throw new Error("Not authenticated");
  }
  const id = formData.get("session")!.toString();

  await db.chromeSession.delete({
    where: {
      id: id,
      AND: {
        userId: session.user.id,
      },
    },
  });
  localsSession.delete(id);
  return { success: true };
}
