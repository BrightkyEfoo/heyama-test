import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ObjectEntity } from './object.schema';
import { CreateObjectDto } from './dto/create-object.dto';
import { MinioService } from '../minio/minio.service';

@Injectable()
export class ObjectsService {
  constructor(
    @InjectModel(ObjectEntity.name) private objectModel: Model<ObjectEntity>,
    private minioSvc: MinioService,
  ) {}

  async create(dto: CreateObjectDto, file: Express.Multer.File) {
    const imageUrl = await this.minioSvc.uploadFile(file);
    const obj = new this.objectModel({
      title: dto.title,
      descripton: dto.descripton,
      imageUrl,
    });
    return obj.save();
  }

  async findAll(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.objectModel
        .find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.objectModel.countDocuments(),
    ]);
    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const obj = await this.objectModel.findById(id).exec();
    if (!obj) throw new NotFoundException(`Object ${id} not found`);
    return obj;
  }

  async remove(id: string) {
    const obj = await this.objectModel.findById(id).exec();
    if (!obj) throw new NotFoundException(`Object ${id} not found`);
    await this.minioSvc.deleteFile(obj.imageUrl);
    await this.objectModel.findByIdAndDelete(id).exec();
    return { deleted: true };
  }
}
