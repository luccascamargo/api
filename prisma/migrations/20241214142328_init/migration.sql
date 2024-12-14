-- CreateEnum
CREATE TYPE "Condition" AS ENUM ('ATIVO', 'INATIVO', 'PENDENTE');

-- CreateEnum
CREATE TYPE "Plan" AS ENUM ('GRATIS', 'BASICO', 'PRO');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "stripe_id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "sobrenome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefone" TEXT,
    "ativo" BOOLEAN NOT NULL,
    "plano" "Plan" NOT NULL DEFAULT 'GRATIS',
    "data_atualizacao" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_criacao" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "imagem" TEXT,
    "senha" TEXT NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "data_ciacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_atualizacao" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL,
    "inscricao_id" TEXT,
    "usuario_id" TEXT NOT NULL,
    "stripe_produto_id" TEXT,
    "data_atualizacao" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_criacao" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "periodo_inicial" TIMESTAMP(3) NOT NULL,
    "periodo_final" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "adverts" (
    "id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "marca" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "ano_modelo" INTEGER NOT NULL,
    "cor" TEXT NOT NULL,
    "cep" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "preco" INTEGER NOT NULL,
    "portas" TEXT NOT NULL,
    "quilometragem" INTEGER NOT NULL,
    "descricao" TEXT,
    "placa" TEXT NOT NULL,
    "cambio" TEXT NOT NULL,
    "data_cricao" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_atualizacao" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "condicao" "Condition" NOT NULL DEFAULT 'PENDENTE',
    "slug" TEXT NOT NULL,
    "destaque" BOOLEAN,
    "usuario_id" TEXT NOT NULL,

    CONSTRAINT "adverts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "optional" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "optional_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "photos" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "chave" TEXT,
    "anuncio_id" TEXT NOT NULL,

    CONSTRAINT "photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AdvertsToOptional" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_AdvertsToOptional_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_id_key" ON "users"("id");

-- CreateIndex
CREATE UNIQUE INDEX "users_stripe_id_key" ON "users"("stripe_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_id_key" ON "RefreshToken"("id");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_token_key" ON "RefreshToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_id_key" ON "subscriptions"("id");

-- CreateIndex
CREATE UNIQUE INDEX "adverts_slug_key" ON "adverts"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "optional_id_key" ON "optional"("id");

-- CreateIndex
CREATE UNIQUE INDEX "optional_nome_key" ON "optional"("nome");

-- CreateIndex
CREATE INDEX "_AdvertsToOptional_B_index" ON "_AdvertsToOptional"("B");

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adverts" ADD CONSTRAINT "adverts_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "photos" ADD CONSTRAINT "photos_anuncio_id_fkey" FOREIGN KEY ("anuncio_id") REFERENCES "adverts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AdvertsToOptional" ADD CONSTRAINT "_AdvertsToOptional_A_fkey" FOREIGN KEY ("A") REFERENCES "adverts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AdvertsToOptional" ADD CONSTRAINT "_AdvertsToOptional_B_fkey" FOREIGN KEY ("B") REFERENCES "optional"("id") ON DELETE CASCADE ON UPDATE CASCADE;
