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
    description: 'The festival date, ISO 8601. The frontend formats it; the API never ships a formatted date.',
  })
  date!: string;

  @ApiProperty({
    example: '2026-10-17T18:00:00+02:00',
    format: 'date-time',
    description:
      'When doors open. A full timestamp with offset, not "18:00" — the offset is what makes it ' +
      'sortable and comparable with the stage times below.',
  })
  doorsAt!: string;

  @ApiProperty({
    type: 'integer',
    minimum: 0,
    example: 16,
    description: 'Minimum age. A number, so "16+" is the view\'s business and not baked into the data.',
  })
  minimumAge!: number;

  @ApiProperty({ type: VenueDto })
  venue!: VenueDto;
}
