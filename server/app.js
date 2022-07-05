const DEBUG = process.argv[2] == '--debug';
const PORT = DEBUG ? 3001 : 80;

const app = uws.App();
app.listen('0.0.0.0', PORT, token => {
	if (token) {
		console.log(`Listening on port ${PORT}...`);
	}
});