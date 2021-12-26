function read(path) { return fs.readFileSync(path); }

function get(name, data, type) {
    app.get(`/${name}`, res => {
        res.onAborted(() => { });
        res.writeHeader('Cache-Control', 'max-age=86400');
        res.writeHeader('Content-Type', type);
        res.end(data);
    });
}

const quotes = {
    authors: {},
    tags: {},
};
fs.readdirSync('quotes').forEach(authorName => {
    const path = `quotes/${authorName}`;
    quotes.authors[authorName] = [];
    fs.readdirSync(path).forEach(quoteName => {
        const quote = {
            name: `${authorName}/${quoteName}`,
            image: read(`${path}/${quoteName}/image.jpeg`),
            data: JSON.parse(read(`${path}/${quoteName}/data.json`)),
        };
        quotes.authors[authorName].push(quote);
        for (tag of quote.data.tags) {
            if (!quotes.tags[tag]) {
                quotes.tags[tag] = [];
            }
            quotes.tags[tag].push(quote);
        }
    });
});
get('authors.json', JSON.stringify(Object.keys(quotes.authors)), 'application/json');
for (const author in quotes.authors) {
    const authorQuotes = quotes.authors[author];
    get(`authors/${author}.json`, JSON.stringify(authorQuotes.map(q => q.name)), 'application/json');
    for (const quote of authorQuotes) {
        get(`authors/${quote.name}.jpeg`, quote.image, 'image/jpeg');
        get(`authors/${quote.name}.json`, JSON.stringify(quote.data), 'application/json');
    }
}
get('quotes.json', JSON.stringify(Object.keys(quotes.tags)), 'application/json');
for (const tag in quotes.tags) {
    get(`quotes/${tag}.json`, JSON.stringify(quotes.tags[tag].map(q => q.name)), 'application/json');
}

get('favicon.ico', read('assets/favicon.ico'), 'image/vnd.microsoft.icon');
get('icon192.png', read('assets/icon192.png'), 'image/png');
get('logo.png', read('assets/logo.png'), 'image/png');
get('background.png', read('assets/background.png'), 'image/png');
get('robots.txt', read('assets/robots.txt'), 'text/plain');

const html = read('build/out/client.html');
app.get('/**', res => {
    res.onAborted(() => { });
    res.writeHeader('Content-Type', 'text/html');
    res.end(html);
});