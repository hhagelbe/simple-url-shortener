import { IsAlphanumeric, Length } from 'class-validator';

import { AMOUNT_OF_UNIQUE_CODE_CHARACTERS } from '../../../utils/constants';

export class CodeDto {
  @IsAlphanumeric()
  @Length(AMOUNT_OF_UNIQUE_CODE_CHARACTERS, AMOUNT_OF_UNIQUE_CODE_CHARACTERS)
  public code: string;
}

export default CodeDto;
