// CloudFront Function (viewer request). S3 behind CloudFront serves only exact keys, so this maps
// the site's clean URLs to the files Astro builds: /download -> /download/index.html, / -> /index.html.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function handler(event) {
  var request = event.request;
  var uri = request.uri;
  if (uri.endsWith('/')) {
    request.uri = uri + 'index.html';
  } else if (uri.lastIndexOf('.') < uri.lastIndexOf('/') + 1) {
    request.uri = uri + '/index.html';
  }
  return request;
}
