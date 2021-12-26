const fs = require('fs');
const uws = require('uWebSockets.js');
embed('server/app.js');
embed('server/static.js');

app.post('/contact/submit', (res, req) => {
    res.onAborted(() => {});
    let data = '';
    res.onData((chunk, isLast) => {
        data += Buffer.from(chunk).toString();
        if (isLast) {
            data = data.split('\0');
            if (data.length > 2) {
                const email = data[1];
                const path = `contact/${email}.txt`;
                if (fs.existsSync(path)) {
                    res.end('1');
                } else {
                    let file = `Name: ${data[0]}\nEmail: ${email}\nSubject: ${data[2]}`;
                    if (data.length > 3) {
                        file += `\nMessage: ${data[3]}`;
                    }
                    fs.writeFileSync(`contact/${email}.txt`, file);
                    res.end('0');
                }
            }
        }
    });
});