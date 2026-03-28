import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  BadRequestException,
  UnauthorizedException,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Types } from 'mongoose';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { AIService } from '../ai/ai.service';

type AuthUser = {
  tenantId?: string;
  role?: string;
};

@Controller('services')
@UseGuards(JwtAuthGuard)
export class ServicesController {
  constructor(
    private readonly servicesService: ServicesService,
    private readonly aiService: AIService,
  ) {}

  private getTenantIdOrThrow(currentUser: AuthUser): string {
    const tenantId = currentUser?.tenantId;

    if (!tenantId || !Types.ObjectId.isValid(tenantId)) {
      throw new UnauthorizedException('Invalid tenant context');
    }

    return tenantId;
  }

  private ensureOwnerOrManager(currentUser: AuthUser) {
    if (!['owner', 'manager'].includes(currentUser?.role ?? '')) {
      throw new UnauthorizedException(
        'You are not allowed to manage the services catalog',
      );
    }
  }

  @Post()
  create(@CurrentUser() currentUser: AuthUser, @Body() dto: CreateServiceDto) {
    this.ensureOwnerOrManager(currentUser);
    const tenantId = this.getTenantIdOrThrow(currentUser);

    return this.servicesService.createForTenant(tenantId, dto);
  }

  @Post('bulk')
  async createBulk(
    @CurrentUser() currentUser: AuthUser,
    @Body() dtos: CreateServiceDto[],
  ) {
    this.ensureOwnerOrManager(currentUser);

    if (!Array.isArray(dtos) || dtos.length === 0) {
      throw new BadRequestException('At least one service is required');
    }

    const tenantId = this.getTenantIdOrThrow(currentUser);

    return this.servicesService.createManyForTenant(tenantId, dtos);
  }

  @Post('extract-ai')
  @UseInterceptors(FileInterceptor('file'))
  async extractAI(
    @CurrentUser() currentUser: AuthUser,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 10 * 1024 * 1024, // 10 MB
          }),
          new FileTypeValidator({
            fileType: /(jpg|jpeg|png|webp|pdf)$/i,
          }),
        ],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
  ) {
    this.ensureOwnerOrManager(currentUser);

    const extractedServices = await this.aiService.extractServices(file.buffer, file.mimetype);

    return {
      services: extractedServices,
    };
  }

  @Get('catalog')
  getCatalog(@CurrentUser() currentUser: AuthUser) {
    const tenantId = this.getTenantIdOrThrow(currentUser);
    return this.servicesService.findAllByTenant(tenantId);
  }

  @Get(':id')
  findOne(@CurrentUser() currentUser: AuthUser, @Param('id') id: string) {
    const tenantId = this.getTenantIdOrThrow(currentUser);

    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid service id');
    }

    return this.servicesService.findOneForTenant(tenantId, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() currentUser: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateServiceDto,
  ) {
    this.ensureOwnerOrManager(currentUser);
    const tenantId = this.getTenantIdOrThrow(currentUser);

    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid service id');
    }

    return this.servicesService.updateForTenant(tenantId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() currentUser: AuthUser, @Param('id') id: string) {
    this.ensureOwnerOrManager(currentUser);
    const tenantId = this.getTenantIdOrThrow(currentUser);

    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid service id');
    }

    return this.servicesService.removeForTenant(tenantId, id);
  }
}