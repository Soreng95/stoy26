import { Controller, Get, Header, Param } from '@nestjs/common';
import { ApiExtraModels, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags, getSchemaPath } from '@nestjs/swagger';

import { CONTENT_SECTIONS, ContentService } from './content.service';
import { FaqDto, HeroDto, LineupDto, MetaDto, SiteContentDto, SponsorDto, TicketsDto } from './dto';

/**
 * The content is the same for everybody and changes a few times a month, so
 * every response is cacheable. `s-maxage` is the one that matters on Vercel:
 * it lets their CDN answer most requests without waking the function at all.
 */
const CACHE_CONTROL = 'public, max-age=60, s-maxage=300, stale-while-revalidate=86400';

@ApiTags('content')
@ApiExtraModels(MetaDto, HeroDto, LineupDto, TicketsDto, SponsorDto, FaqDto)
@Controller('content')
export class ContentController {
  constructor(private readonly content: ContentService) {}

  @Get()
  @Header('Cache-Control', CACHE_CONTROL)
  @ApiOperation({
    summary: 'The whole content document',
    description:
      'Everything the poster page needs, in one request. This is the shape agreed in issue #26 — ' +
      'fetch it once in App and pass each section down as props.',
  })
  @ApiOkResponse({ type: SiteContentDto })
  findAll(): SiteContentDto {
    return this.content.findAll();
  }

  @Get(':section')
  @Header('Cache-Control', CACHE_CONTROL)
  @ApiOperation({
    summary: 'A single section',
    description: 'The same data, sliced. Useful while building one section in isolation.',
  })
  @ApiParam({
    name: 'section',
    enum: CONTENT_SECTIONS,
    description: 'Which part of the document to return.',
  })
  @ApiOkResponse({
    description: 'The requested section. Which schema you get depends on the path parameter.',
    schema: {
      oneOf: [
        ...[MetaDto, HeroDto, LineupDto, TicketsDto, FaqDto].map((dto) => ({ $ref: getSchemaPath(dto) })),
        // `sponsors` is the one section that is a bare array rather than an object.
        { type: 'array', items: { $ref: getSchemaPath(SponsorDto) } },
      ],
    },
  })
  @ApiNotFoundResponse({ description: 'No section by that name. The message lists the valid ones.' })
  findSection(@Param('section') section: string) {
    return this.content.findSection(section);
  }
}
