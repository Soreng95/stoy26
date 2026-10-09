import { ApiProperty } from '@nestjs/swagger';

/** One name in the marquee — issue #17. */
export class SponsorDto {
  @ApiProperty({ example: 'NORDLYS' })
  name!: string;

  @ApiProperty({
    example: 'archivo',
    description: 'Which display face to set this name in, so the marquee looks typeset rather than uniform.',
  })
  font!: string;
}
