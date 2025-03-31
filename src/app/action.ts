"use server";

import { auth } from "~/server/auth";
import { db, localsSession } from "~/server/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export async function DeleteOrigin(formData: FormData) {
  const session = await auth();
  if (!session) {
    throw new Error("Not authenticated");
  }
  try {
    const originId = formData.get("origin");
    console.log(originId);
    if (!originId || typeof originId !== "string") {
      return { success: false, error: "Origin ID is required" };
    }

    // Convert string ID to number since Prisma typically uses numeric IDs

    // Delete using the correct 'where' clause

    await db.request.updateMany({
      where: {
        allowedOriginId: originId,
      },
      data: {
        allowedOriginId: null,
      },
    });
    await db.allowedOrigin.delete({
      where: {
        id: originId,
        AND: {
          userId: session.user.id,
        },
      },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error deleting origin:", error);
    return { success: false, error: String(error) };
  }
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
