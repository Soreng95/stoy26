import { ApiProperty } from '@nestjs/swagger';

export const CURRENCIES = ['NOK', 'SEK', 'DKK', 'EUR'] as const;
export type Currency = (typeof CURRENCIES)[number];

/**
 * An amount of money, as two fields instead of one string.
 *
 * `amountMinor` is in *minor units* — øre, not kroner. 690 NOK is 69000.
 * That looks fussy for a poster, and it is the standard for one good reason:
 * minor units are integers, and integers do not drift. `0.1 + 0.2` is
 * 0.30000000000000004 in JavaScript, so the moment anything adds a booking
 * fee or splits a two-for-one price, major units start producing prices that
 * are a half-øre off and a total that does not match the sum of its lines.
 *
 * The currency is a separate field because it is separate data: it drives
 * which symbol to print and where to put it. Norwegian writes `690 kr`,
 * English writes `NOK 690`, and that is a decision for the view, not for
 * whoever edits the content file.
 *
 * The frontend formats it, and the platform already knows how:
 *
 *     new Intl.NumberFormat("nb-NO", {
 *       style: "currency",
 *       currency: price.from.currency,
 *       maximumFractionDigits: 0,
 *     }).format(price.from.amountMinor / 100)   // "690 kr"
 */
export class MoneyDto {
  @ApiProperty({
    type: 'integer',
    minimum: 0,
    example: 69000,
    description: 'Amount in minor units (øre). 690 NOK is 69000. Always an integer.',
  })
  amountMinor!: number;

  @ApiProperty({
    enum: CURRENCIES,
    example: 'NOK',
    description: 'ISO 4217 code. A union, so a typo is a build error rather than an unformattable price.',
  })
  currency!: Currency;
}
