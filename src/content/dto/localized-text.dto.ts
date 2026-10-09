import { ApiProperty } from '@nestjs/swagger';

/**
 * A string that exists in both languages.
 *
 * The poster is bilingual, and issue #26 leaves one decision open: is every
 * bilingual string an object, or only the long ones? We landed on "only where
 * the two languages are genuinely separate sentences" — artist bios and FAQ
 * answers. Short display copy (the hero subtitle, the ticket meta line) keeps
 * both languages baked into one string, because that is how it is typeset on
 * the poster: `Fyll inn - drag the stub`, on one line, as one piece of design.
 *
 * If the group decides to make it consistent instead, this is the type to
 * spread everywhere — and the compiler will list every call site that breaks.
 */
export class LocalizedTextDto {
  @ApiProperty({ example: 'Dørene åpner 18:00.', description: 'Norwegian copy.' })
  no!: string;

  @ApiProperty({ example: 'Doors open at 18:00.', description: 'English copy.' })
  en!: string;
}
