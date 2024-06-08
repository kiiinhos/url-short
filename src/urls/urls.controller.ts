import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  ParseIntPipe,
  Res,
  NotFoundException,
} from '@nestjs/common';
import { Response } from 'express';
import { UrlsService } from './urls.service';
import { CreateUrlDto } from './dto/create-url.dto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UrlAuthGuard } from '../auth/url-auth-guard';
import { AppLogger } from '../common/logger/logger.service'; // Importar o logger

@ApiTags('urls')
@Controller('urls')
export class UrlsController {
  constructor(
    private readonly urlsService: UrlsService,
    private readonly logger: AppLogger, // Injetar o logger
  ) {}

  @Post()
  @UseGuards(UrlAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Encurtar uma URL' })
  @ApiResponse({ status: 201, description: 'URL encurtada com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  async create(@Body() createUrlDto: CreateUrlDto, @Request() req: any) {
    this.logger.log('Encurtando uma URL');
    const user = req.user || undefined;
    const url = await this.urlsService.create(createUrlDto, user);
    return {
      id: url.id,
      originalUrl: url.originalUrl,
      shortUrl: url.shortUrl,
      user: url.user ? { id: url.user.id, email: url.user.email } : null,
      clicks: url.clicks,
      createdAt: url.createdAt,
      updatedAt: url.updatedAt,
      deletedAt: url.deletedAt,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar URLs encurtadas pelo usuário autenticado' })
  @ApiResponse({ status: 200, description: 'URLs listadas com sucesso.' })
  async findAll(@Request() req: any) {
    this.logger.log('Listando URLs encurtadas pelo usuário autenticado');
    return this.urlsService.findAllByUser(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar a origem de uma URL encurtada' })
  @ApiResponse({ status: 200, description: 'URL atualizada com sucesso.' })
  @ApiResponse({ status: 404, description: 'URL não encontrada.' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() createUrlDto: CreateUrlDto,
    @Request() req: any,
  ) {
    this.logger.log(`Atualizando URL com ID: ${id}`);
    return this.urlsService.update(id, createUrlDto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deletar (logicamente) uma URL encurtada' })
  @ApiResponse({ status: 200, description: 'URL deletada com sucesso.' })
  @ApiResponse({ status: 404, description: 'URL não encontrada.' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`Deletando URL com ID: ${id}`);
    await this.urlsService.remove(id);
    return { message: 'URL deletada com sucesso.' };
  }

  @Get(':shortUrl')
  @ApiOperation({ summary: 'Redirecionar para a URL original' })
  @ApiResponse({ status: 302, description: 'Redirecionamento bem-sucedido.' })
  @ApiResponse({ status: 404, description: 'URL não encontrada.' })
  async redirect(@Param('shortUrl') shortUrl: string, @Res() res: Response) {
    try {
      this.logger.log(`Redirecionando URL curta: ${shortUrl}`);
      const originalUrl = await this.urlsService.redirectToOriginalUrl(
        shortUrl,
      );
      res.redirect(originalUrl);
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(
          `URL com short URL ${shortUrl} não encontrada`,
          error.stack || 'No stack trace',
        );
      } else {
        this.logger.error(
          `URL com short URL ${shortUrl} não encontrada`,
          'Unknown error',
        );
      }
      throw new NotFoundException(
        `URL com short URL ${shortUrl} não encontrada`,
      );
    }
  }
}
