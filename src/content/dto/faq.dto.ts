import { ApiProperty } from '@nestjs/swagger';
import { LocalizedTextDto } from './localized-text.dto';

/** One accordion item — issues #18 and #19. */
export class FaqItemDto {
  @ApiProperty({
    example: 'faq-doors',
    description: 'Stable slug. The accordion needs it for aria-controls, so it cannot be an array index.',
  })
  id!: string;

  @ApiProperty({ type: LocalizedTextDto, description: 'The question.' })
  q!: LocalizedTextDto;

  @ApiProperty({ type: LocalizedTextDto, description: 'The answer.' })
  a!: LocalizedTextDto;
}

export class FaqDto {
  @ApiProperty({ example: 'Spørsmål / Questions' })
  title!: string;

  @ApiProperty({ type: [FaqItemDto] })
  items!: FaqItemDto[];
}
