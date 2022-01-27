const fs = require('fs-extra');

async function get(req, res) {
    res.setHeader('Content-Type', 'text/html');
    res.setHeader(
        "Content-Security-Policy",
        "default-src 'self'; script-src 'self' 'unsafe-inline' *.googleapis.com cdn.jsdelivr.net *.cloudflare.com; base-uri 'self'; block-all-mixed-content; font-src 'self' https: data:; frame-ancestors 'self'; img-src 'self' data:; object-src 'none'; script-src-attr 'none'; style-src 'self' https: 'unsafe-inline'; upgrade-insecure-requests;"
    );
    res.render('short', { public: this.c.public });
    res.end();

}

const getHostname = (url) => {
    try {
        return new URL(url).hostname;
    } catch (ex) {
        return null;
    }
}

async function post(req, res) {
    const userIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    res.setHeader('Content-Type', 'text/text');
    if (!this.auth(this.c.key, req.body.password, this.c) && !this.c.public) {
        res.statusCode = 401;
        res.redirect('/short?error=Incorrect_Password');
        res.end();
        return this.log.warning(`Unauthorized User | URL Shorten | ${userIP}`);
    }
    const protocol = this.protocol();
    const fileName = this.randomToken(this.c.shortUrlLength);
    if (req.body.URL === '' || req.body.URL === null) {
        res.redirect('/short?error=No URL Input');
        return res.end();
    }
    const stream = fs.createWriteStream(`${__dirname}/../uploads/${fileName}.html`);
    stream.once('open', () => {

        const hostname = getHostname(req.body.URL);
        let description;

        if (hostname != null) {
            description = `Clicking this URL will automatically redirect you to a page on the "${hostname}" external site in your browser.`
        } else {
            description = "Clicking this URL will automatically redirect you to a page on an external site in your browser."
        }

        let embed = `
                   <meta property="og:site_name" content="Redirect URL">
                   <meta property="og:title" content="Isaac Kogan's CDN"/>
                   <meta property="og:url"/>
                   <meta property="og:image" content="/assets/images/shortener-icon.ico"/>
                   <meta property="og:description" content='${description}'/>
            `

        stream.write(embed + `<meta http-equiv="refresh" content="0;URL='${req.body.URL}'" />`);
        stream.end();
        if (this.monitorChannel !== null) this.bot.createMessage(this.monitorChannel, `\`\`\`MARKDOWN\n[NEW][SHORT URL]\n[URL](${req.body.URL})\n[NEW](${req.headers.host}/${fileName})\n[IP](${userIP})\n\`\`\``);
        this.log.verbose(`New Short URL: ${protocol}://${req.headers.host}/${fileName} | IP: ${userIP}`);
        res.redirect(`/short?success=${protocol}://${req.headers.host}/${fileName}`);
        this.db.get('files')
            .push({ path: `/${fileName}`, ip: userIP, views: 0 })
            .write();
        return res.end();
    });
}
module.exports = { get, post };
