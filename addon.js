
'use strict';

const { addonBuilder, serveHTTP } = require('stremio-addon-sdk');

const items = [
  {
    id: 'sample:big-buck-bunny',
    type: 'movie',
    name: 'Big Buck Bunny Demo',
    poster: 'https://peach.blender.org/wp-content/uploads/title_anouncement.jpg',
    description: 'Demo movie',
    year: '2008',
    url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
  },
  {
    id: 'sample:elephants-dream',
    type: 'movie',
    name: "Elephant's Dream Demo",
    poster: 'https://orange.blender.org/wp-content/themes/orange/images/media/ed_header.jpg',
    description: 'Demo movie',
    year: '2006',
    url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'
  }
];

const manifest = {
  id: 'org.example.stremio.tvstarter',
  version: '1.0.0',
  name: 'TV Catalog Starter',
  description: 'Simple TV movie catalog',
  resources: ['catalog', 'meta', 'stream'],
  types: ['movie'],
  catalogs: [{
    type: 'movie',
    id: 'tvstarter',
    name: 'TV Starter Catalog',
    extra: [{ name: 'search', isRequired: false }]
  }],
  idPrefixes: ['sample:']
};

const builder = new addonBuilder(manifest);

builder.defineCatalogHandler(({ extra = {} }) => {
  const q = String(extra.search || '').toLowerCase();
  const metas = items
    .filter(x => !q || x.name.toLowerCase().includes(q))
    .map(({ id, type, name, poster, year }) => ({
      id, type, name, poster, releaseInfo: year
    }));
  return Promise.resolve({ metas });
});

builder.defineMetaHandler(({ id }) => {
  const item = items.find(x => x.id === id);
  if (!item) return Promise.resolve({ meta: null });
  const { url, ...meta } = item;
  return Promise.resolve({ meta });
});

builder.defineStreamHandler(({ id }) => {
  const item = items.find(x => x.id === id);
  return Promise.resolve({
    streams: item ? [{ title: 'Demo stream', url: item.url }] : []
  });
});

const port = Number(process.env.PORT || 7000);
serveHTTP(builder.getInterface(), { port });
