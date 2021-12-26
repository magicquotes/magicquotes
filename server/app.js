const useSSL = fs.existsSync('cert.pem');
const app = (() => {
    if (useSSL) {
        uws.App().get('/**', (res, req) => {
            res.onAborted(() => {});
            res.writeStatus('301');
            res.writeHeader('location', 'https://magicquotes.org' + req.getUrl());
            res.end();
        }).listen('0.0.0.0', 80, () => { });

        return uws.SSLApp({
            cert_file_name: 'cert.pem',
            key_file_name: 'key.pem',
        });
    } else {
        return uws.App();
    }
})();

const PORT = useSSL ? 443 : 3001;
app.listen('0.0.0.0', PORT, token => {
    if (token) {
        console.log(`Listening on port ${PORT}...`);
    }
});