import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, IsNull } from 'typeorm';
import { Url } from './entities/url.entity';
import { CreateUrlDto } from './dto/create-url.dto';
import { User } from '../users/entities/user.entity';
import { AppLogger } from '../common/logger/logger.service';

@Injectable()
export class UrlsService {
  constructor(
    @InjectRepository(Url)
    private urlsRepository: Repository<Url>,
    private readonly logger: AppLogger,
  ) {}

  async create(createUrlDto: CreateUrlDto, user?: User): Promise<Url> {
    this.logger.log('Criando uma nova URL encurtada');
    const shortUrl = this.generateShortUrl();
    const url = new Url();
    url.originalUrl = createUrlDto.originalUrl;
    url.shortUrl = shortUrl;
    url.deletedAt = null;

    if (user) {
      url.user = user;
    }

    await this.urlsRepository.save(url);
    return url;
  }

  async findAllByUser(userId: number): Promise<any[]> {
    this.logger.log(`Buscando todas as URLs do usuário com ID: ${userId}`);
    const urls = await this.urlsRepository.find({
      where: [
        {
          user: { id: userId } as FindOptionsWhere<User>,
          deletedAt: IsNull(),
        },
        {
          user: IsNull(),
          deletedAt: IsNull(),
        },
      ],
      relations: ['user'],
    });

    return urls.map((url) => {
      if (url.user) {
        const { password, ...userWithoutPassword } = url.user;
        return { ...url, user: userWithoutPassword };
      }
      return url;
    });
  }

  async update(
    id: number,
    createUrlDto: CreateUrlDto,
    user: User,
  ): Promise<any> {
    this.logger.log(`Atualizando URL com ID: ${id}`);
    const url = await this.findOneById(id);

    if (!url) {
      const error = new Error(`URL com ID ${id} não encontrada`);
      this.logger.error(error.message, error.stack || 'No stack trace');
      throw new NotFoundException(error.message);
    }

    url.originalUrl = createUrlDto.originalUrl;

    if (user && (!url.user || url.user.id !== user.id)) {
      url.user = user;
    }

    url.updatedAt = new Date();
    const updatedUrl = await this.urlsRepository.save(url);

    if (updatedUrl.user) {
      const { password, ...userWithoutPassword } = updatedUrl.user;
      return { ...updatedUrl, user: userWithoutPassword };
    } else {
      return updatedUrl;
    }
  }

  async findOneById(id: number): Promise<Url> {
    const url = await this.urlsRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['user'],
    });
    if (!url) {
      throw new NotFoundException(`URL com ID ${id} não encontrada`);
    }
    return url;
  }

  async remove(id: number): Promise<void> {
    this.logger.log(`Removendo URL com ID: ${id}`);
    const url = await this.findOneById(id);
    if (!url) {
      const error = new Error(`URL com ID ${id} não encontrada`);
      this.logger.error(error.message, error.stack || 'No stack trace');
      throw new NotFoundException(error.message);
    }
    url.deletedAt = new Date();
    await this.urlsRepository.save(url);
  }

  async redirectToOriginalUrl(shortUrl: string): Promise<string> {
    this.logger.log(
      `Redirecionando para a URL original usando a URL curta: ${shortUrl}`,
    );
    const url = await this.urlsRepository.findOne({
      where: { shortUrl: shortUrl, deletedAt: IsNull() },
      relations: ['user'],
    });
    if (!url) {
      const error = new Error(`URL com short URL ${shortUrl} não encontrada`);
      this.logger.error(error.message, error.stack || 'No stack trace');
      throw new NotFoundException(error.message);
    }
    url.clicks++;
    await this.urlsRepository.save(url);
    return url.originalUrl;
  }

  private generateShortUrl(): string {
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let shortUrl = '';
    for (let i = 0; i < 6; i++) {
      shortUrl += characters.charAt(
        Math.floor(Math.random() * characters.length),
      );
    }
    return shortUrl;
  }
}
