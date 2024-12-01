import { relations } from "drizzle-orm";
import {
  pgTable,
  varchar,
  uuid,
  boolean,
  timestamp,
  primaryKey,
  numeric,
} from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: uuid().primaryKey().defaultRandom(),
  nome: varchar({ length: 255 }).notNull(),
  sobrenome: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  telefone: varchar({ length: 255 }),
  ativo: boolean().notNull().default(true),
  criado_em: timestamp().defaultNow(),
  atualizado_em: timestamp().defaultNow(),
  imagem: varchar({ length: 255 }),
  senha: varchar({ length: 255 }),
});

export const userRelations = relations(usersTable, ({ many }) => ({
  anuncios: many(advertsTable),
  inscricoes: many(subscriptionsTable),
  refreshToken: many(refreshTokenTable)
}));

export const advertsTable = pgTable("adverts", {
  id: uuid().primaryKey().defaultRandom(),
  tipo: varchar({ length: 255 }).notNull(),
  marca: varchar({ length: 255 }).notNull(),
  modelo: varchar({ length: 255 }).notNull(),
  ano_modelo: numeric().notNull(),
  cor: varchar({ length: 255 }).notNull(),
  cep: varchar({ length: 255 }).notNull(),
  cidade: varchar({ length: 255 }).notNull(),
  estado: varchar({ length: 255 }).notNull(),
  preco: numeric().notNull(),
  portas: varchar({ length: 255 }).notNull(),
  quilometragem: numeric().notNull(),
  descricao: varchar({ length: 255 }),
  placa: varchar({ length: 255 }).notNull(),
  cambio: varchar({ length: 255 }).notNull(),
  slug: varchar({ length: 255 }).notNull(),
  destaque: boolean().default(false),
  criado_em: timestamp().defaultNow(),
  atualizado_em: timestamp().defaultNow(),
  user_id: uuid(),
});

export const advertsRelations = relations(advertsTable, ({ one, many }) => ({
  author: one(usersTable, {
    fields: [advertsTable.user_id],
    references: [usersTable.id],
  }),
  opcionais: many(advertsToOptionals),
  imagens: many(imageTable)
}));

export const optionalTable = pgTable("optionals", {
  id: uuid().primaryKey().defaultRandom(),
  nome: varchar({ length: 255 }).notNull().unique(),
});

export const optionalsRelations = relations(optionalTable, ({  many }) => ({
  anuncios: many(advertsToOptionals)
}));

export const imageTable = pgTable("images", {
  id: uuid().primaryKey().defaultRandom(),
  uri: varchar({ length: 255 }).notNull().unique(),
  key: varchar({ length: 255 }).notNull().unique(),
  advert_id: uuid(),
});

export const advertsToOptionals = pgTable(
  'adverts_to_optionals',
  {
    advertId: uuid('advert_id')
      .notNull()
      .references(() => advertsTable.id),
    optionalId: uuid('optional_id')
      .notNull()
      .references(() => optionalTable.id),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.advertId, t.optionalId] }),
  }),
);

export const imagesRelations = relations(imageTable, ({ one }) => ({
  anuncio: one(advertsTable, {
		fields: [imageTable.advert_id],
		references: [advertsTable.id],
	}),
}));

export const subscriptionsTable = pgTable("subscriptions", {
  id: uuid().primaryKey().defaultRandom(),
  status: boolean().notNull().default(false),
  criado_em: timestamp().defaultNow(),
  atualizado_em: timestamp().defaultNow(),
  user_id: uuid(),
});

export const subscriptionsRelations = relations(subscriptionsTable, ({ one }) => ({
  author: one(usersTable, {
    fields: [subscriptionsTable.user_id],
    references: [usersTable.id],
  }),
}));


export const advertsToOptionalsRelations = relations(advertsToOptionals, ({ one }) => ({
  optional: one(optionalTable, {
    fields: [advertsToOptionals.optionalId],
    references: [optionalTable.id],
  }),
  advert: one(advertsTable, {
    fields: [advertsToOptionals.advertId],
    references: [advertsTable.id],
  }),
}));


export const refreshTokenTable = pgTable("refresh_token", {
  id: uuid().primaryKey().defaultRandom(),
  token: varchar({ length: 255 }).notNull().unique(),
  criado_em: timestamp().defaultNow(),
  atualizado_em: timestamp().defaultNow(),
  user_id: uuid(),
})

export const refreshTokenRelations = relations(refreshTokenTable, ({ one }) => ({
  anuncio: one(usersTable, {
		fields: [refreshTokenTable.user_id],
		references: [usersTable.id],
	}),
}));
