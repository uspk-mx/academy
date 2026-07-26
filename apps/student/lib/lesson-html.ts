import sanitizeHtml from "sanitize-html"

/**
 * Lesson bodies are HTML written by instructors in the admin editor, then
 * injected with `dangerouslySetInnerHTML`. This runs in the loader, so the
 * browser only ever receives sanitized markup and the sanitizer stays out of
 * the client bundle.
 *
 * The content is first-party, and a survey of all 121 lessons found no script
 * tags, event handlers or `javascript:` URLs today. This is not about what is
 * stored now — it is so a compromised instructor account, or a bug in the
 * editor, cannot turn one lesson into stored XSS against every student.
 *
 * The allowlist matches what the editor actually emits (TipTap): p, span,
 * strong, em, ul/ol/li, h1-h4, br, hr, div, plus links, images and tables for
 * content authored later.
 */
const ALLOWED_TAGS = [
  "p",
  "span",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "mark",
  "sub",
  "sup",
  "br",
  "hr",
  "div",
  "blockquote",
  "pre",
  "code",
  "ul",
  "ol",
  "li",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "a",
  "img",
  "figure",
  "figcaption",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
  "iframe",
  // The editor embeds media inline in the body — some questions carry a video
  // (often a base64 data: URI) right in their description. Without these it
  // would be silently stripped and a "watch the video" question would show no
  // video.
  "video",
  "audio",
  "source",
]

/**
 * `style` is kept because the editor writes it on ~1,450 elements and dropping
 * it would visibly change existing lessons — but allowing the attribute is not
 * enough on its own. sanitize-html passes declarations through untouched unless
 * `allowedStyles` is set, so `style="background:url(javascript:…)"` would
 * survive an allowlist that only names the attribute.
 *
 * A survey of every stored lesson found exactly one property in use — `color`,
 * always `rgb(...)` — so the allowlist below is that, and nothing else. It
 * preserves all existing styling and leaves no room for a URL-bearing value.
 *
 * `class` is kept too, but it is editor bookkeeping ("text-node") that matches
 * nothing in our CSS — the prose styles deliberately target elements instead.
 */
const ALLOWED_STYLES: sanitizeHtml.IOptions["allowedStyles"] = {
  "*": {
    color: [
      /^rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*(,\s*(0|1|0?\.\d+)\s*)?\)$/,
      /^#[0-9a-fA-F]{3,8}$/,
      /^[a-zA-Z]+$/,
    ],
    "background-color": [
      /^rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*(,\s*(0|1|0?\.\d+)\s*)?\)$/,
      /^#[0-9a-fA-F]{3,8}$/,
      /^[a-zA-Z]+$/,
    ],
    "text-align": [/^(left|right|center|justify|start|end)$/],
  },
}

const ALLOWED_ATTRIBUTES: sanitizeHtml.IOptions["allowedAttributes"] = {
  "*": ["class", "style", "dir", "lang"],
  a: ["href", "target", "rel", "title"],
  img: ["src", "alt", "title", "width", "height", "loading"],
  iframe: ["src", "width", "height", "title", "allow", "allowfullscreen"],
  video: ["src", "width", "height", "poster", "controls", "preload"],
  audio: ["src", "controls", "preload"],
  source: ["src", "type"],
  td: ["colspan", "rowspan"],
  th: ["colspan", "rowspan", "scope"],
}

/** Exactly one lesson embeds a YouTube video; nothing else may be framed. */
const ALLOWED_IFRAME_HOSTNAMES = [
  "www.youtube.com",
  "youtube.com",
  "www.youtube-nocookie.com",
  "youtube-nocookie.com",
  "player.vimeo.com",
]

export function sanitizeLessonHtml(html: string): string {
  if (!html) return ""

  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTRIBUTES,
    allowedStyles: ALLOWED_STYLES,
    // No `javascript:` destinations. `data:` is allowed only for media (img,
    // video, audio, source) — a `data:video/mp4` can't execute script, unlike
    // `data:text/html`, which stays blocked for links and everything else.
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: {
      img: ["http", "https", "data"],
      video: ["http", "https", "data"],
      audio: ["http", "https", "data"],
      source: ["http", "https", "data"],
    },
    allowedIframeHostnames: ALLOWED_IFRAME_HOSTNAMES,
    allowProtocolRelative: false,
    transformTags: {
      // Anything opening a new tab must not hand the opener over with it.
      a: (tagName, attribs) => ({
        tagName,
        attribs: {
          ...attribs,
          ...(attribs.target === "_blank"
            ? { rel: "noopener noreferrer" }
            : {}),
        },
      }),
      // Ensure embedded videos/audio are actually playable — the editor doesn't
      // always add the controls attribute.
      video: (tagName, attribs) => ({
        tagName,
        attribs: { ...attribs, controls: "controls", preload: "metadata" },
      }),
      audio: (tagName, attribs) => ({
        tagName,
        attribs: { ...attribs, controls: "controls", preload: "metadata" },
      }),
    },
    /*
     * A frame whose src was rejected keeps its (now empty) tag, which the
     * prose styles would render as a bordered 16:9 blank box. Drop it instead.
     */
    exclusiveFilter: (frame) =>
      frame.tag === "iframe" && !frame.attribs.src,
  })
}
