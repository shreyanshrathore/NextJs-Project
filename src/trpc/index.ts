import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { publicProcedure, router, privateProcedure } from "./trpc"
import { TRPCError } from "@trpc/server"
import { db } from "@/db"
import { z } from "zod"
export const appRouter = router({
  authCallback: publicProcedure.query(async () => {
    const { getUser } = getKindeServerSession()
    const user = getUser()
    if (!user || !user.id || !user.email) {
      console.log("yes error sent")
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "unauthorized error",
      })
    }

    // check if user in the database
    const dbUser = await db.user.findFirst({
      where: {
        id: user.id,
      },
    })

    if (!dbUser) {
      // create a new User
      const g = await db.user.create({
        data: {
          id: user.id,
          email: user.email,
        },
      })
    }
    return { success: true }
  }),

  getUserFiles: privateProcedure.query(async ({ ctx }) => {
    const { user, userId } = ctx
    console.log(userId)
    const files = await db.file.findMany()
    console.log(files)
    return files
  }),

  getFile: privateProcedure
    .input(z.object({ key: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx

      const file = await db.file.findFirst({
        where: {
          key: input.key,
          userId,
        },
      })

      if (!file) {
        throw new TRPCError({ code: "NOT_FOUND" })
      }
      return file
    }),

  deleteFile: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx

      const file = await db.file.findFirst({
        where: {
          id: input.id,
          userId,
        },
      })

      if (!file) {
        throw new TRPCError({ code: "NOT_FOUND" })
      }

      await db.file.delete({
        where: {
          id: input.id,
        },
      })

      return file
    }),
})
// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter
