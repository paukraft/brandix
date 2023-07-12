import { type Name as PrismaName } from '@prisma/client/edge'
import { Kysely } from 'kysely'
import { PlanetScaleDialect } from 'kysely-planetscale'

interface Database {
  Name: PrismaName
}

export const kysely = new Kysely<Database>({
  dialect: new PlanetScaleDialect({
    host: process.env.DATABASE_HOST,
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
  }),
})
