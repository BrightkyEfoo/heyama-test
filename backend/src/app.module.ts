import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ObjectsModule } from './objects/objects.module';
import { MinioModule } from './minio/minio.module';

@Module({
  imports: [
    MongooseModule.forRoot(
      process.env.MONGO_URI || 'mongodb://localhost:27017/heyama',
    ),
    ObjectsModule,
    MinioModule,
  ],
})
export class AppModule {}
