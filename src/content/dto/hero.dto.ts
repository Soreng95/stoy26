import { ApiProperty } from '@nestjs/swagger';

/** Issues #5 (layout), #6 (neon outline headline) and #7 (scroll cue). */
export class HeroDto {
  @ApiProperty({ example: 'En natt / One night — 17.10.2026' })
  eyebrow!: string;

  @ApiProperty({
    example: 'STØY',
    description: 'The large word. Rendered as a neon outline, so keep it short and uppercase.',
  })
  titleMain!: string;

  @ApiProperty({ example: '26', description: 'The year half of the headline, styled separately.' })
  titleYear!: string;

  @ApiProperty({ example: 'Én kveld med nordisk støy / One night of Nordic noise' })
  subtitle!: string;

  @ApiProperty({
    example: '/images/hero.jpg',
    description: 'Path relative to the frontend public/ folder, not a URL on this API.',
  })
  image!: string;

  @ApiProperty({
    example: 'Publikum i motlys foran en scene',
    description: 'Alt text. Required by #21 — never ship an empty string here.',
  })
  imageAlt!: string;

  @ApiProperty({ example: 'Scroll' })
  scrollCue!: string;
}
