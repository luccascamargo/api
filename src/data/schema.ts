import { pgTable, varchar, uuid, boolean, timestamp } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: uuid().primaryKey().defaultRandom(),
  nome: varchar({ length: 255 }).notNull(),
  sobrenome: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  telefone: varchar({ length: 255 }),
  ativo: boolean().notNull().default(true),
  criado_em: timestamp().defaultNow(),
  atualizado_em: timestamp().defaultNow(),
  imagem: varchar({length: 255}),
  senha: varchar({length: 255}),
});
