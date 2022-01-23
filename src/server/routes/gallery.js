const fs = require('fs-extra');

async function get(_req, res) {
    res.setHeader('Content-Type', 'text/html');
    res.setHeader(
        "Content-Security-Policy",
        "default-src 'self'; script-src 'self' 'unsafe-inline' *.googleapis.com cdn.jsdelivr.net *.cloudflare.com; base-uri 'self'; block-all-mixed-content; font-src 'self' https: data:; frame-ancestors 'self'; img-src 'self' data:; object-src 'none'; script-src-attr 'none'; style-src 'self' https: 'unsafe-inline'; upgrade-insecure-requests;"
    );

    res.render('galleryLogin');
    res.end();
}
async function post(req, res) {
    const userIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    res.setHeader('Content-Type', 'text/html');

    const protocol = this.protocol();
    var password = this.c.admin.key;
    // Compatibility with old config
    if(typeof password == "string"){
      password = [password];
    }
    if (!this.c.admin.key.includes(req.body.password)) {
        res.statusCode = 401;
        res.render('unauthorized');
        res.end();
        return this.log.warning(`Unauthorized User | Gallery Access | ${userIP} | ${req.body.password}`);
    }
    this.log.warning(`IP Address: ${userIP} successfully accessed gallery with key ${req.body.password}`);
    if (this.monitorChannel !== null) this.bot.createMessage(this.monitorChannel, `\`\`\`MARKDOWN\n[GALLERY ACCESS][USER]\n[IP](${userIP})\n[KEY](${req.body.password})\n\`\`\``);
    fs.readdir(`${__dirname}/../uploads`, (err, files) => {
        let pics = [];
        files = files.map(fileName => {
          return {
            name: fileName,
            time: fs.statSync(`${__dirname}/../uploads/${fileName}`).mtime.getTime()
          };
        })
        files.sort((a, b) => {
          return b.time - a.time; });
        files = files.map(v => {
          return v.name; });
          files.forEach((file, idx, array) => {
            if (file.toString().includes('.jpg') || file.toString().includes('.png') || file.toString().includes('.gif')) {
              pics.push(`${protocol}://${req.headers.host}/${file.toString()}`);
            }
            if (idx === array.length - 1) {
                res.render('gallery', {
                  pictures: pics,
                });
                  return res.end();
            }
        })
      });

}
module.exports = { get, post };
