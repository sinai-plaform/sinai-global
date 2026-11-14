import { handler } from '../../../server/mag-core.js';
import { site } from '../../../server/mag-site.js';
// /xx/magazine and /xx/magazine/<slug> for the other nine languages
export const onRequest = handler(site);
