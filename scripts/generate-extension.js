const { includeURLs, pathFiltered } = require('../generate-helper');
const packageJSON = require('../package.json');
const fs = require('fs');
const path = require('path');
const process = require('node:process');
const archiver = require('archiver');

const env = process.env.BROSWER ?? 'chrome';

const manifest = {
    manifest_version: 3,
    name: packageJSON.displayName,
    author: packageJSON.author,
    description: packageJSON.description,
    version: packageJSON.version,
    icons: {
        16: 'images/16.png',
        24: 'images/24.png',
        48: 'images/48.png',
        64: 'images/64.png',
        128: 'images/128.png'
    },
    content_scripts: [
        {
            js: [
                'scripts/content-script.js'
            ],
            matches: includeURLs,
            run_at: 'document_start'
        }
    ],
    web_accessible_resources: [
        {
            resources: ['scripts/chibi.user.js'],
            matches: pathFiltered()
        }
    ]
};

/**
 * @param {String} sourceDir: /some/folder/to/compress
 * @param {String} outPath: /path/to/created.zip
 * @returns {Promise}
 */
function zipDirectory (sourceDir, outPath) {
    const archive = archiver('zip', { zlib: { level: 9 }});
    const stream = fs.createWriteStream(outPath);

    return new Promise((resolve, reject) => {
        archive
            .directory(sourceDir, false)
            .on('error', err => reject(err))
            .pipe(stream)
        ;

        stream.on('close', () => resolve());
        archive.finalize();
    });
}

(async function pack () {
    console.log(`Packing extension for ${env}`);
    fs.copyFileSync(
        path.resolve(__dirname, '../dist/chibi.user.js'),
        path.resolve(__dirname, '../extension/scripts/chibi.user.js')
    );
    fs.writeFileSync(
        path.resolve(__dirname, '../extension/manifest.json'),
        JSON.stringify(manifest)
    );
    zipDirectory(
        path.resolve(__dirname, '../extension/'),
        path.resolve(__dirname, `../dist/unpacked-extension.zip`)
    );
    console.log('Done');
})();
