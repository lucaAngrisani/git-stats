import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr';
import express from 'express';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import bootstrap from './src/main.server';

export function app(): express.Express {
  const server = express();
  const serverDistFolder = dirname(fileURLToPath(import.meta.url));
  const browserDistFolder = resolve(serverDistFolder, '../browser');
  const indexHtmlTemplate = (lang: string) =>
    join(serverDistFolder, `../server/${lang}/index.server.html`);

  const commonEngine = new CommonEngine();

  const supportedLanguages = ['en', 'it'];

  // Middleware per rilevare la lingua
  server.use('/:lang', (req, res, next) => {
    const lang = req.params.lang;
    const lang_use = supportedLanguages.includes(lang) ? lang : 'en';

    res.locals['lang'] = lang;
    next();
  });

  // Serve i file statici localizzati
  server.use('/:lang', (req, res, next) => {
    const lang = res.locals['lang'];
    const langBrowserDistFolder = resolve(browserDistFolder, lang);

    express.static(langBrowserDistFolder, {
      maxAge: '1y',
      index: 'index.html',
    })(req, res, next);
  });

  // Gestisce SSR per ogni lingua
  server.get('/:lang/**', (req, res, next) => {
    const lang = res.locals['lang'];
    const indexHtml = indexHtmlTemplate(lang);

    commonEngine
      .render({
        bootstrap,
        documentFilePath: indexHtml,
        url: req.originalUrl,
        publicPath: resolve(browserDistFolder, lang),
        providers: [{ provide: APP_BASE_HREF, useValue: `/${lang}` }],
      })
      .then((html) => res.send(html))
      .catch((err) => next(err));
  });

  return server;
}

function run(): void {
  const port = process.env['PORT'] || 4000;
  const server = app();
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

run();
