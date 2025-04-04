-- AlterTable
CREATE SEQUENCE models_id_seq;
ALTER TABLE "models" ALTER COLUMN "id" SET DEFAULT nextval('models_id_seq');
ALTER SEQUENCE models_id_seq OWNED BY "models"."id";
