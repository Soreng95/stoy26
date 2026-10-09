import { ApiProperty } from '@nestjs/swagger';

export class VenueDto {
  @ApiProperty({ example: 'Sentrum Scene' })
  name!: string;

  @ApiProperty({ example: 'Arbeidergata 2, 0159 Oslo' })
  address!: string;
}

export class MetaDto {
  @ApiProperty({ example: 'STØY / 26', description: 'Used for <title> and share cards.' })
  title!: string;

  @ApiProperty({
    example: '2026-10-17',
    format: 'date',
    description: 'ISO 8601 date. The frontend formats it; the API never ships a formatted date.',
  })
  date!: string;

  @ApiProperty({ type: VenueDto })
  venue!: VenueDto;
}
