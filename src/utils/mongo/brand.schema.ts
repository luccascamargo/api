import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type BrandDocument = HydratedDocument<Brand>;

@Schema()
export class Brand {
  @Prop()
  label: string;

  @Prop()
  value: string;

  @Prop()
  reference: number;

  @Prop()
  typeCode: string;

  @Prop()
  updatedAt: string;
}

export const BrandSchema = SchemaFactory.createForClass(Brand);
