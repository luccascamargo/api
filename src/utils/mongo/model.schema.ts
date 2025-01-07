import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ModelDocument = HydratedDocument<Model>;

@Schema()
export class Model {
  @Prop()
  label: string;

  @Prop()
  value: number;

  @Prop()
  reference: number;

  @Prop()
  typeCode: string;

  @Prop()
  brandCode: string;

  @Prop()
  updatedAt: string;
}

export const ModelSchema = SchemaFactory.createForClass(Model);
