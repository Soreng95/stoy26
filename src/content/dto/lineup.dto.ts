import { ApiProperty } from '@nestjs/swagger';
import { LocalizedTextDto } from './localized-text.dto';

/**
 * Headliners render larger than support acts (#9), which is a layout decision
 * driven by data rather than by two separate components.
 */
export const ARTIST_TIERS = ['headliner', 'support'] as const;
export type ArtistTier = (typeof ARTIST_TIERS)[number];

export class ArtistDto {
  @ApiProperty({
    example: 'aurora',
    description: 'Stable slug. Used as the React key and as the modal anchor in #11.',
  })
  id!: string;

  @ApiProperty({ example: 'Aurora' })
  name!: string;

  @ApiProperty({ example: 'Bergen' })
  city!: string;

  @ApiProperty({ example: 'Art-pop' })
  genre!: string;

  @ApiProperty({
    enum: ARTIST_TIERS,
    example: 'headliner',
    description: 'Drives card size in the grid. A union, so a typo is a build error.',
  })
  tier!: ArtistTier;

  @ApiProperty({ example: 'Headliner', description: 'The label printed on the card.' })
  role!: string;

  @ApiProperty({
    example: '2026-10-17T23:15:00+02:00',
    format: 'date-time',
    description:
      'When this act goes on. A full timestamp, not "23:15", because the night runs past midnight: ' +
      'the 00:30 set is on the 18th. Sorting the old HH:mm strings put it first on the bill instead of last.',
  })
  startsAt!: string;

  @ApiProperty({ example: '/images/artists/aurora.jpg' })
  image!: string;

  @ApiProperty({ example: 'Portrett av Aurora på scenen' })
  imageAlt!: string;

  @ApiProperty({ type: LocalizedTextDto, description: 'Long-form copy for the modal in #12.' })
  bio!: LocalizedTextDto;
}

/** The "to be revealed" placeholder card — issue #10. */
export class RevealDto {
  @ApiProperty({ example: 'Siste navn / Final name' })
  label!: string;

  @ApiProperty({ example: 'TO BE REVEALED' })
  name!: string;

  @ApiProperty({ example: 'Annonseres 1. september / Announced 1 September' })
  note!: string;
}

export class LineupDto {
  @ApiProperty({ example: 'Line-up' })
  title!: string;

  @ApiProperty({ example: '12 artister - 2 scener / 12 artists - 2 stages' })
  meta!: string;

  @ApiProperty({ type: [ArtistDto] })
  artists!: ArtistDto[];

  @ApiProperty({ type: RevealDto })
  reveal!: RevealDto;
}
