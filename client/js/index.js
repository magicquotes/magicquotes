function updatePage(href) {
    for (const page of document.getElementsByClassName('page')) {
        page.style = 'display:none';
    }

    for (const link of document.querySelectorAll('.nav-link')) {
        link.classList.remove('nav-link-active');
    }

    const path = href.split('/');
    const page = document.getElementById(path[1]);
    if (!page) {
        document.getElementById('landing').style = '';
        history.replaceState(null, '', href = '/');
        return;
    }
    page.style = '';

    if (href !== '/') {
        document.querySelector('[href="/' + path[1] + '"]').classList.add('nav-link-active');
    }

    if (path[1] === 'authors') {
        const authors = document.querySelector('#authors > .quotes');
        if (path.length === 2) {
            fetch(`/authors.json`).then(res => res.json()).then(data => {
                authors.innerHTML = makeQuoteRows('authors', data);
            });
        } else if (path.length === 3) {
            fetch(`/authors/${path[2]}.json`).then(res => res.json()).then(data => {
                const name = path[2].replaceAll('-', ' ');
                document.querySelector('#authors > h1').innerText = name;
                document.querySelector('#authors > h2').innerText = `Discover Most Famous Quotes by ${name}`;
                authors.innerHTML = '';
                for (const quote of data) {
                    authors.append(makeQuote(quote, false));
                }
            });
        } else {
            authors.append(makeQuote(path.slice(2).join('/'), true));
        }
    } else if (path[1] === 'quotes') {
        const quotes = document.querySelector('#quotes > .quotes');
        if (path.length === 2) {
            fetch(`/quotes.json`).then(res => res.json()).then(data => {
                quotes.innerHTML = makeQuoteRows('quotes', data);
            });
        } else {
            fetch(`/quotes/${path[2]}.json`).then(res => res.json()).then(data => {
                document.querySelector('#quotes > h1').innerText = `${path[2].replaceAll('-', ' ')} Quotes`;
                for (const quote of data) {
                    quotes.append(makeQuote(quote, false));
                }
            });
        }
    }
}

function makeQuoteRows(prefix, data) {
    let html = '';
    for (const row of data) {
        html += '<div class="content"><div><a>Magic Quotes</a> - Share our beautiful quote pictures on <a>Facebook</a>, <a>Twitter</a>, and <a>Pinterest</a></div><div>';
        fetch(`/${prefix}/${row}.json`).then(res => res.json()).then(data => {
            for (const quote of data) {
                html += `<div><img src="/authors/${row}/${quote}.jpeg"><div><a></a><a></a><a></a></div></div>`;
            }
        });
        html += '</div></div>';
    }
    return html;
}

function makeQuote(name, big) {
    const quote = document.createElement('div');
    if (big) {
        quote.classList.add('big-quote', 'content');
    }
    quote.classList.add('quote');
    const top = document.createElement(big ? 'blockquote' : 'a');
    top.classList.add('quote-top');
    if (!big) {
        top.href = `/authors/${name}`;
    }
    top.innerHTML = `<img src="/authors/${name}.jpeg">`;
    const text = document.createTextNode('?');
    top.append(text);
    quote.append(top);
    const author = document.createElement('a');
    author.classList.add('quote-author');
    author.href = `/authors/${name.split('/')[0]}`;
    author.innerText = '?';
    quote.append(author);
    const tags = document.createElement('div');
    tags.innerText = 'Tags: ?';
    quote.append(tags);
    fetch(`/authors/${name}.json`).then(res => res.json()).then(data => {
        text.nodeValue = data.text;
        author.innerText = data.author;
        tags.innerText = 'Tags:';
        for (const tag of data.tags) {
            tags.innerHTML += `<a href="/quotes/${tag}">${tag} Quotes</a>`;
        }
    });
    return quote;
}

function autorun() {
    window.onpopstate = () => {
        updatePage(location.pathname);
    };

    document.querySelectorAll('.nav-link').forEach(e => {
        e.onclick = () => {
            history.pushState(null, '', e.href);
            updatePage(e.getAttribute('href'));
            return false;
        }
    });

    updatePage(location.pathname);

    fetch(`/authors.json`).then(res => res.json()).then(data => {
        for (const author of data) {
            document.getElementById('author-list').innerHTML += `<a href="/authors/${author}">${author.replaceAll('-', ' ')}</a>`;
        }
    });
    fetch(`/quotes.json`).then(res => res.json()).then(data => {
        for (const tag of data) {
            document.getElementById('quote-list').innerHTML += `<a href="/quotes/${tag}">${tag} Quotes</a>`;
        }
    });
}