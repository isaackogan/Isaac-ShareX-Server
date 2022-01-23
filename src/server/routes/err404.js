async function err404(req, res) {
    res.setHeader('Content-Type', 'text/html');
    res.setHeader(
        "Content-Security-Policy",
        "default-src 'self'; script-src 'self' 'unsafe-inline' *.googleapis.com cdn.jsdelivr.net *.cloudflare.com; base-uri 'self'; block-all-mixed-content; font-src 'self' https: data:; frame-ancestors 'self'; img-src 'self' data:; object-src 'none'; script-src-attr 'none'; style-src 'self' https: 'unsafe-inline'; upgrade-insecure-requests;"
    );
    res.statusCode = 404;
    res.render('404');
    res.end();
}
module.exports = err404;
