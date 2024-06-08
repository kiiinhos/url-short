import { IsNotEmpty, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUrlDto {
  @ApiProperty({
    description: 'A URL original a ser encurtada',
    example: 'https://example.com',
  })
  @IsUrl({}, { message: 'URL inválida' })
  @IsNotEmpty({ message: 'A URL não pode estar vazia' })
  originalUrl: string;

  constructor(originalUrl: string) {
    this.originalUrl = originalUrl;
  }
}
