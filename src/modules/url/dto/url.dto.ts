import { IsString, IsUrl } from 'class-validator';

import CodeDto from './url.code.dto';

export class UrlDto extends CodeDto {
  @IsString()
  @IsUrl(undefined, { message: 'Not a valid url.' })
  public shortUrl: string;

  @IsString()
  @IsUrl(undefined, { message: 'Not a valid url.' })
  public originalUrl: string;
}

export default UrlDto;
