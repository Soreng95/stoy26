import { Injectable, NotFoundException } from '@nestjs/common';

import rawContent from './data/stoy26.json';
import { ARTIST_TIERS, ArtistTier, SiteContentDto } from './dto';

/**
 * Narrow one string from the JSON file into the union the DTO promises.
 *
 * TypeScript reads a .json file and widens every string to `string`, so the
 * literal union `'headliner' | 'support'` cannot survive the import on its
 * own. This function is the seam: it fails loudly at startup rather than
 * serving `tier: "headlinr"` to a frontend that will silently render nothing.
 */
function toArtistTier(value: string, artistId: string): ArtistTier {
  if ((ARTIST_TIERS as readonly string[]).includes(value)) {
    return value as ArtistTier;
  }
  throw new Error(
    `stoy26.json: artist "${artistId}" has tier "${value}". Expected one of: ${ARTIST_TIERS.join(', ')}.`,
  );
}

/**
 * The content document, checked against the contract at build time.
 *
 * `satisfies` is doing the real work here: if the JSON loses a field that
 * SiteContentDto requires, `pnpm build` fails with the path to the missing
 * key. That is the whole reason this API exists instead of the frontend
 * importing a JSON file directly — the contract is checked in one place.
 */
const CONTENT = {
  ...rawContent,
  lineup: {
    ...rawContent.lineup,
    artists: rawContent.lineup.artists.map((artist) => ({
      ...artist,
      tier: toArtistTier(artist.tier, artist.id),
    })),
  },
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
