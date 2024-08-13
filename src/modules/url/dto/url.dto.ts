import { IsAlphanumeric, IsString, IsUrl, Length } from 'class-validator';

import { AMOUNT_OF_UNIQUE_CODE_CHARACTERS } from '../../../utils/constants';

export class UrlDto {
  @IsAlphanumeric()
  @Length(AMOUNT_OF_UNIQUE_CODE_CHARACTERS, AMOUNT_OF_UNIQUE_CODE_CHARACTERS)
  public code: string;

  @IsString()
  @IsUrl(undefined, { message: 'Not a valid url.' })
  public shortUrl: string;

  @IsString()
  @IsUrl(undefined, { message: 'Not a valid url.' })
  public originalUrl: string;
}

export default UrlDto;
