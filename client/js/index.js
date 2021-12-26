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

    document.querySelector('#authors > h1, #authors > h2, #quotes > h1').style = path.length === 3 ? '' : 'display:none';
    if (path[1] === 'authors') {
        const authors = document.querySelector('#authors > .quotes');
        if (path.length === 2) {
            fetch(`/authors.json`).then(res => res.json()).then(data => {
                for (const row of makeQuoteRows('authors', data)) {
                    authors.append(row);
                }
            });
        } else if (path.length === 3) {
            fetch(`/authors/${path[2]}.json`).then(res => res.json()).then(data => {
                const name = path[2].replaceAll('-', ' ');
                document.querySelector('#authors > h1').innerText = `${name} Quotes`;
                document.querySelector('#authors > h2').innerText = `Discover Most Famous Quotes by ${name}`;
                authors.innerHTML = '';
                for (const quote of data) {
                    authors.append(makeQuote(quote, false));
                }
            });
        } else {
            authors.innerHTML = '';
            authors.append(makeQuote(path.slice(2).join('/'), true));
        }
    } else if (path[1] === 'quotes') {
        const quotes = document.querySelector('#quotes > .quotes');
        if (path.length === 2) {
            fetch(`/quotes.json`).then(res => res.json()).then(data => {
                for (const row of makeQuoteRows('quotes', data)) {
                    quotes.append(row);
                }
            });
        } else {
            fetch(`/quotes/${path[2]}.json`).then(res => res.json()).then(data => {
                document.querySelector('#quotes > h1').innerText = `${path[2].replaceAll('-', ' ')} Quotes`;
                quotes.innerHTML = '';
                for (const quote of data) {
                    quotes.append(makeQuote(quote, false));
                }
            });
        }
    }
}

function onLink(link) {
    link.onclick = () => {
        if (link.href === window.location.href) {
            return false;
        }
        history.pushState(null, '', link.href);
        updatePage(link.getAttribute('href'));
        return false;
    };
}

function makeQuoteRows(prefix, data) {
    let rows = [];
    for (const row of data) {
        const element = document.createElement('div');
        element.classList.add('quote-row');
        const top = document.createElement('div');
        top.innerHTML = `<a href="/${prefix}/${row}">${row.replaceAll('-', ' ')} Quotes</a> - Share our beautiful quote pictures on <a href="https://facebook.com/sharer.php?u=https://magicquotes.org/${prefix}/${row}">Facebook</a>, <a href="https://twitter.com/intent/tweet?url=https://magicquotes.org/${prefix}${row}">Twitter</a>, and <a href="https://pinterest.com/pin/create/button/?url=https://magicquotes.org/${prefix}/${row}">Pinterest</a>`;
        element.append(top);
        const bottom = document.createElement('div');
        bottom.classList.add('quote-row-bottom');
        fetch(`/${prefix}/${row}.json`).then(res => res.json()).then(data => {
            for (const quote of data) {
                const quoteElement = document.createElement('div');
                quoteElement.innerHTML = `<a href="/authors/${quote}"><img src="/authors/${quote}.jpeg"></a><div><a></a><a></a><a></a></div>`;
                bottom.append(quoteElement);
            }
        });
        element.append(bottom);
        rows.push(element);
    }
    return rows;
}

function makeQuote(name, big) {
    const quote = document.createElement('div');
    if (big) {
        quote.classList.add('big-quote');
    }
    quote.classList.add('quote');
    const top = document.createElement(big ? 'blockquote' : 'a');
    top.classList.add('quote-top');
    if (!big) {
        top.href = `/authors/${name}`;
        onLink(top);
    }
    top.innerHTML = `<img src="/authors/${name}.jpeg">`;
    const text = document.createTextNode('?');
    top.append(text);
    quote.append(top);
    const author = document.createElement('a');
    author.classList.add('quote-author');
    author.href = `/authors/${name.split('/')[0]}`;
    author.innerText = '?';
    onLink(author);
    quote.append(author);
    const tags = document.createElement('div');
    tags.innerText = 'Tags: ?';
    quote.append(tags);
    fetch(`/authors/${name}.json`).then(res => res.json()).then(data => {
        text.nodeValue = data.text;
        author.innerText = data.author;
        tags.innerText = 'Tags:';
        for (const tag of data.tags) {
            const tagElement = document.createElement('a');
            tagElement.href = `/quotes/${tag}`;
            tagElement.innerText = `${tag} Quotes`;
            onLink(tagElement);
            tags.append(tagElement);
        }
    });
    return quote;
}

function autorun() {
    window.onpopstate = () => {
        updatePage(location.pathname);
    };

    for (const link of document.querySelectorAll('.nav-link')) {
        onLink(link);
    }

    updatePage(location.pathname);

    fetch(`/authors.json`).then(res => res.json()).then(data => {
        for (const author of data) {
            const link = document.createElement('a');
            link.href = `/authors/${author}`;
            link.innerText = author.replaceAll('-', ' ');
            onLink(link);
            document.getElementById('author-list').append(link);
        }
    });
    fetch(`/quotes.json`).then(res => res.json()).then(data => {
        for (const tag of data) {
            const link = document.createElement('a');
            link.href = `/quotes/${tag}`;
            link.innerText = `${tag} Quotes`;
            onLink(link);
            document.getElementById('quote-list').append(link);
        }
    });
}