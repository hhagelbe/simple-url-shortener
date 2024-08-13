import { IsAlphanumeric, IsString, IsUrl, Length } from 'class-validator';

export class GetUrlDto {
  @IsAlphanumeric()
  @Length(6, 6)
  public code: string;

  @IsString()
  @IsUrl(undefined, { message: 'Not a valid url.' })
  public shortUrl: string;

  @IsString()
  @IsUrl(undefined, { message: 'Not a valid url.' })
  public originalUrl: string;
}

export default GetUrlDto;
