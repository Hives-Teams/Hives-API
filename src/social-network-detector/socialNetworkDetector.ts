import socialNetworkPatterns from './data/social-networks-patterns';
import uriParser from './parser';

export default function socialNetworkDetector(uri: string): string | null {
  const uriParts = uriParser(uri);

  for (const socialNetworkLabel in socialNetworkPatterns) {
    if (!socialNetworkPatterns.hasOwnProperty(socialNetworkLabel)) {
      continue;
    }

    for (const searchRegexp of socialNetworkPatterns[socialNetworkLabel]) {
      if (searchRegexp.test(uriParts.host)) {
        return socialNetworkLabel;
      }
    }
  }

  return null;
}
