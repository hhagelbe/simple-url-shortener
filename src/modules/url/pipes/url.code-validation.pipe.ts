import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { IsAlphanumeric, Length, validate } from 'class-validator';

import { AMOUNT_OF_UNIQUE_CODE_CHARACTERS } from '../../../utils/constants';

class CodeDto {
  @IsAlphanumeric()
  @Length(AMOUNT_OF_UNIQUE_CODE_CHARACTERS, AMOUNT_OF_UNIQUE_CODE_CHARACTERS)
  code: string;
}

@Injectable()
export class CodeValidationPipe implements PipeTransform {
  async transform(value: any) {
    const obj = plainToClass(CodeDto, { code: value });
    const errors = await validate(obj);

    if (errors.length > 0) {
      throw new BadRequestException(`Invalid code format`);
    }

    return value;
  }
}
