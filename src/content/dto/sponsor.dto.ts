import { ApiProperty } from '@nestjs/swagger';

/**
 * Which display face a sponsor name is set in.
 *
 * These are the three faces the design uses, so this is a union rather than
 * a free string: `font: "archvio"` used to type-check happily and then fall
 * back to whatever the browser felt like.
 */
export const SPONSOR_FONTS = ['archivo', 'grotesk', 'mono'] as const;
export type SponsorFont = (typeof SPONSOR_FONTS)[number];

/** One name in the marquee — issue #17. */
export class SponsorDto {
  @ApiProperty({ example: 'NORDLYS' })
  name!: string;

  @ApiProperty({
    enum: SPONSOR_FONTS,
    example: 'archivo',
    description: 'So the marquee looks typeset rather than uniform.',
  })
  font!: SponsorFont;
}
