import { Injectable, NotFoundException } from '@nestjs/common';

import { isoDate, isoTimestamp, oneOf, wholeNumber } from './content.guards';
import rawContent from './data/stoy26.json';
import { ARTIST_TIERS, CURRENCIES, SPONSOR_FONTS, SiteContentDto } from './dto';

/**
 * The content document, checked against the contract in two passes.
 *
 * `satisfies SiteContentDto` at the bottom is the compile-time half: lose a
 * key the DTOs require and `pnpm build` fails, naming it. The guards are the
 * runtime half, for the three things a .json import cannot express — literal
 * unions, integers, and timestamps that parse. Between them, serving a
 * half-valid document is not a state this API can reach.
 */
const CONTENT = {
  ...rawContent,

  meta: {
    ...rawContent.meta,
    date: isoDate(rawContent.meta.date, 'meta.date'),
    doorsAt: isoTimestamp(rawContent.meta.doorsAt, 'meta.doorsAt'),
    minimumAge: wholeNumber(rawContent.meta.minimumAge, 'meta.minimumAge'),
  },

  lineup: {
    ...rawContent.lineup,
    artists: rawContent.lineup.artists.map((artist) => ({
      ...artist,
      tier: oneOf(ARTIST_TIERS, artist.tier, `lineup.artists[${artist.id}].tier`),
      startsAt: isoTimestamp(artist.startsAt, `lineup.artists[${artist.id}].startsAt`),
    })),
  },

  tickets: {
    ...rawContent.tickets,
    price: {
      ...rawContent.tickets.price,
      from: {
        amountMinor: wholeNumber(rawContent.tickets.price.from.amountMinor, 'tickets.price.from.amountMinor'),
        currency: oneOf(CURRENCIES, rawContent.tickets.price.from.currency, 'tickets.price.from.currency'),
      },
      earlyBirdUntil: isoDate(rawContent.tickets.price.earlyBirdUntil, 'tickets.price.earlyBirdUntil'),
    },
  },

  sponsors: rawContent.sponsors.map((sponsor) => ({
    ...sponsor,
    font: oneOf(SPONSOR_FONTS, sponsor.font, `sponsors[${sponsor.name}].font`),
  })),
} satisfies SiteContentDto;

export const CONTENT_SECTIONS = ['meta', 'hero', 'lineup', 'tickets', 'sponsors', 'faq'] as const;
export type ContentSection = (typeof CONTENT_SECTIONS)[number];

@Injectable()
export class ContentService {
  /** The whole document. One request, everything the page needs. */
  findAll(): SiteContentDto {
    return CONTENT;
  }

  /**
   * One section, for when a component only needs its own slice.
   *
   * Returns the union of section types. The controller documents each one
   * for Swagger, since OpenAPI cannot express "depends on the path param"
   * any better than `oneOf`.
   */
  findSection(section: string): SiteContentDto[ContentSection] {
    if (!(CONTENT_SECTIONS as readonly string[]).includes(section)) {
      throw new NotFoundException(
        `Unknown section "${section}". Available sections: ${CONTENT_SECTIONS.join(', ')}.`,
      );
    }

    return CONTENT[section as ContentSection];
  }
}
