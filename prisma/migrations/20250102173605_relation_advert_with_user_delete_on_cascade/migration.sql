-- DropForeignKey
ALTER TABLE "adverts" DROP CONSTRAINT "adverts_usuario_id_fkey";

-- AddForeignKey
ALTER TABLE "adverts" ADD CONSTRAINT "adverts_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
