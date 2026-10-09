import { ApiProperty } from '@nestjs/swagger';
import { FaqDto } from './faq.dto';
import { HeroDto } from './hero.dto';
import { LineupDto } from './lineup.dto';
import { MetaDto } from './meta.dto';
import { SponsorDto } from './sponsor.dto';
import { TicketsDto } from './tickets.dto';

/**
 * The whole content document — the contract issue #26 is about.
 *
 * Every section is required. There is no `Partial` and no optional field
 * anywhere in this file, and that is deliberate: a component that destructures
 * `price.label` crashes on a half-filled object, so the contract either holds
 * completely or the build fails here, in one place, instead of in the browser.
 */
export class SiteContentDto {
  @ApiProperty({ type: MetaDto })
  meta!: MetaDto;

  @ApiProperty({ type: HeroDto })
  hero!: HeroDto;

  @ApiProperty({ type: LineupDto })
  lineup!: LineupDto;

  @ApiProperty({ type: TicketsDto })
  tickets!: TicketsDto;

  @ApiProperty({ type: [SponsorDto] })
  sponsors!: SponsorDto[];

  @ApiProperty({ type: FaqDto })
  faq!: FaqDto;
}
