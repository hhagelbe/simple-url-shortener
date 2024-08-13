import { IsString, IsUrl } from 'class-validator';

export class CreateShortUrlDto {
  @IsString()
  @IsUrl(undefined, { message: 'Not a valid url.' })
  public url: string;
}

export default CreateShortUrlDto;
