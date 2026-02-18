import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class ObjectEntity extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: false, default: null })
  descripton: string;

  @Prop({ required: true })
  imageUrl: string;

  @Prop({ default: () => new Date() })
  createdAt: Date;
}

export const ObjectSchema = SchemaFactory.createForClass(ObjectEntity);
