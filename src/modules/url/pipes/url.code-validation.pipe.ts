import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

import CodeDto from '../dto/url.code.dto';

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
