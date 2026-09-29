// Watermark applied at DELIVERY time, via the Cloudinary URL itself - not
// at upload time. We first tried baking the watermark into the upload-time
// "incoming" transformation (multer-storage-cloudinary's `transformation`
// option), and it passed every test we ran directly against Cloudinary's
// API - but it silently did not apply on real uploads made through the
// live app, for reasons we could not pin down.
//
// So instead: don't touch how the file is uploaded at all. Just store the
// asset's delivery URL with the watermark transformation segment already
// baked into the URL path. Cloudinary re-applies that transformation every
// single time the URL is fetched - when the app displays it, and equally
// when someone right-clicks "Save image/video as" - so there's no upload
// step that can silently skip it.
const WATERMARK_URL_TRANSFORM = 'co_white,g_center,l_text:Arial_30:linkpii.com,o_60';

// Turns a plain Cloudinary delivery URL into one with the watermark baked
// in, e.g.
//   https://res.cloudinary.com/<cloud>/image/upload/v169.../abc.jpg
// becomes
//   https://res.cloudinary.com/<cloud>/image/upload/<transform>/v169.../abc.jpg
// Works for both /image/upload/ and /video/upload/ URLs. Safe to call on
// anything - non-Cloudinary values, null/undefined - and returns the input
// unchanged in those cases.
//
// If the URL already carries a transform segment right after "/upload/"
// (i.e. an older version of this same watermark, baked in by a previous
// version of WATERMARK_URL_TRANSFORM), that segment is swapped out for the
// current one instead of being left in place or stacked under a second
// one. Nothing else in this app ever writes a transform segment into a
// stored URL, so any segment found there is always ours to replace. A
// Cloudinary version segment (e.g. "v1708004101") is never mistaken for a
// transform segment, since it's matched separately below.
function withWatermark(url) {
  if (!url || typeof url !== 'string') return url;
  const uploadMatch = url.match(/\/(image|video)\/upload\//);
  if (!uploadMatch) return url;
  const type = uploadMatch[1];

  const segmentRe = new RegExp(`/${type}/upload/([^/]+)/`);
  const segmentMatch = url.match(segmentRe);

  if (segmentMatch && !/^v\d+$/.test(segmentMatch[1])) {
    // Next path part after "/upload/" isn't a version segment, so it's an
    // existing (older) watermark transform - replace it.
    if (segmentMatch[1] === WATERMARK_URL_TRANSFORM) return url;
    return url.replace(segmentRe, `/${type}/upload/${WATERMARK_URL_TRANSFORM}/`);
  }

  // No transform segment yet - insert the watermark fresh.
  return url.replace(`/${type}/upload/`, `/${type}/upload/${WATERMARK_URL_TRANSFORM}/`);
}

module.exports = { withWatermark, WATERMARK_URL_TRANSFORM };
