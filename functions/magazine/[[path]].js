import { handler } from '../../server/mag-core.js';
import { site } from '../../server/mag-site.js';
// /magazine, /magazine/<slug>, /magazine/sitemap.xml, /magazine/llms.txt (root language)
export const onRequest = handler(site);
