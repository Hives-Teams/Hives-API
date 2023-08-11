import url from 'url';

export default function uriParser(uri: string): {
  path: string | null;
  protocol: string | null;
  host: string;
} {
  const parsedUrl = url.parse(uri, true);

  return {
    protocol: parsedUrl.protocol
      ? parsedUrl.protocol.substr(0, parsedUrl.protocol.length - 1)
      : null,
    host: parsedUrl.hostname,
    path: parsedUrl.pathname
      ? parsedUrl.pathname.substr(1, parsedUrl.pathname.length)
      : null,
  };
}
