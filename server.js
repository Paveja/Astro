const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 4173;

const server = http.createServer((req, res) => {
	const parsedUrl = new URL(req.url, `http://localhost:${PORT}`);
	const pathname = parsedUrl.pathname;

	if (pathname === '/' || pathname === '') {
		const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf-8');
		res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
		res.end(html);
	} else if (pathname === '/styles.css') {
		const css = fs.readFileSync(path.join(__dirname, 'styles.css'), 'utf-8');
		res.writeHead(200, { 'Content-Type': 'text/css; charset=utf-8' });
		res.end(css);
	} else {
		res.writeHead(404, { 'Content-Type': 'text/plain' });
		res.end('404 Not Found');
	}
});

server.listen(PORT, () => {
	console.log(`Server running at http://localhost:${PORT}`);
});
