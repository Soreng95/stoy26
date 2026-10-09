import { ApiProperty } from '@nestjs/swagger';

export class TicketPriceDto {
  @ApiProperty({ example: 'Fra / From' })
  label!: string;

  @ApiProperty({ example: '690 NOK' })
  amount!: string;

  @ApiProperty({ example: 'Early bird til 31.08' })
  note!: string;
}

/**
 * One input on the ticket — issue #14.
 *
 * The error *messages* live here with the rest of the copy, because they are
 * copy. The validation *rules* stay in the component: a regex in JSON is a
 * regex nobody can see in a diff.
 */
export class TicketFieldDto {
  @ApiProperty({ example: 'E-post / Email' })
  label!: string;

  @ApiProperty({ example: 'navn@epost.no' })
  placeholder!: string;

  @ApiProperty({
    example: 'Sjekk e-postadressen / Check the email address',
    description: 'Shown when the field is invalid. Announced to screen readers in #21.',
  })
  invalid!: string;
}

export class TicketFieldsDto {
  @ApiProperty({ type: TicketFieldDto })
  email!: TicketFieldDto;

  @ApiProperty({ type: TicketFieldDto })
  phone!: TicketFieldDto;
}

/** The draggable stub — #13 draws it, #15 makes it drag. */
export class TicketStubDto {
  @ApiProperty({ example: 'Drag to claim' })
  label!: string;

  @ApiProperty({
    example: 'Dra stubben til høyre for å sikre billetten',
    description: 'Instruction for keyboard and screen-reader users, who cannot see the drag affordance (#15).',
  })
  hint!: string;
}

/** The success state after a successful drag — issue #16. */
export class TicketClaimedDto {
  @ApiProperty({ example: 'Plassen er sikret' })
  title!: string;

  @ApiProperty({ example: 'Vi sender bekreftelse på e-post / Confirmation on its way' })
  note!: string;
}

/**
 * The tickets section — issues #13 through #16.
 *
 * NOTE: this is a superset of the shape proposed in issue #26. That proposal
 * had `price` as a flat string and no `title`/`meta`/`name`/`edition`, but the
 * component built in #13 needs all four, and the price is typeset as three
 * separate pieces. Paste this shape into #26 as the final version.
 */
export class TicketsDto {
  @ApiProperty({ example: 'Sikre plassen' })
  title!: string;

  @ApiProperty({ example: 'Fyll inn - dra stubben for å sikre billetten din / Fill in - drag the stub' })
  meta!: string;

  @ApiProperty({ example: 'En natt - Admit one - 17.10.2026', description: 'The small line above the event name.' })
  tag!: string;

  @ApiProperty({ example: 'STØY', description: 'Rendered as outline text, like the hero headline.' })
  name!: string;

  @ApiProperty({ example: '/26', description: 'The accented half of the ticket headline.' })
  edition!: string;

  @ApiProperty({ example: 'Sentrum Scene, Oslo - Doors: 18:00 - 16+' })
  info!: string;

  @ApiProperty({ type: TicketPriceDto })
  price!: TicketPriceDto;

  @ApiProperty({ type: TicketFieldsDto })
  fields!: TicketFieldsDto;

  @ApiProperty({ type: TicketStubDto })
  stub!: TicketStubDto;

  @ApiProperty({ type: TicketClaimedDto })
  claimed!: TicketClaimedDto;
}
