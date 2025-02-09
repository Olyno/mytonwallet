import { GlobalState, UserToken } from '../types';

import memoized from '../../util/memoized';
import { bigStrToHuman } from '../helpers';
import { round } from '../../util/round';

export function selectHasSession(global: GlobalState) {
  return Boolean(global.addresses);
}

export const selectAllTokensMemoized = memoized((
  balances: Exclude<GlobalState['balances'], undefined>,
  tokenInfo: Exclude<GlobalState['tokenInfo'], undefined>,
) => {
  const allBySlug = Object
    .values(balances.byAccountId)
    .reduce((acc, byAccountId) => {
      return {
        ...acc,
        ...byAccountId.bySlug,
      };
    }, {} as Record<string, string>);

  return Object
    .entries(allBySlug)
    .filter(([slug]) => (slug in tokenInfo.bySlug))
    .map(([slug, balance]) => {
      const amount = bigStrToHuman(balance);
      const {
        symbol, name, image, quote: {
          price, percentChange24h, percentChange7d, percentChange30d, history,
        },
      } = tokenInfo.bySlug[slug];

      return {
        symbol,
        slug,
        amount,
        name,
        image,
        price,
        change24h: round(percentChange24h / 100, 4),
        change7d: round(percentChange7d / 100, 4),
        change30d: round(percentChange30d / 100, 4),
        history,
      } as UserToken;
    });
});

export function selectAllTokens(global: GlobalState) {
  if (!global.balances || !global.tokenInfo) {
    return undefined;
  }

  return selectAllTokensMemoized(global.balances, global.tokenInfo);
}
