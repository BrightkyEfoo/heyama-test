import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UploadedFile,
  UseInterceptors,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ObjectsService } from './objects.service';
import { ObjectsGateway } from './objects.gateway';
import { CreateObjectDto } from './dto/create-object.dto';
import { PaginationDto } from './dto/pagination.dto';

@Controller('objects')
export class ObjectsController {
  constructor(
    private readonly objectsSvc: ObjectsService,
    private readonly gateway: ObjectsGateway,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body() dto: CreateObjectDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('image file is requried');
    const obj = await this.objectsSvc.create(dto, file);
    this.gateway.notifyCreated(obj);
    return obj;
  }

  @Get()
  async findAll(@Query() query: PaginationDto) {
    const page = parseInt(query.page || '1');
    const limit = parseInt(query.limit || '12');
    return this.objectsSvc.findAll(page, limit);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.objectsSvc.findOne(id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const result = await this.objectsSvc.remove(id);
    this.gateway.notifyDeleted(id);
    return result;
  }
}
