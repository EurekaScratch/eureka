const includeURLs = [
    'https://scratch.mit.edu/projects/*',
    'https://aerfaying.com/Projects/*',
    'https://www.ccw.site/*',
    'https://gitblock.cn/Projects/*',
    'https://world.xiaomawang.com/*',
    'https://cocrea.world/*',
    'https://create.codelab.club/*',
    'https://www.scratch-cn.cn/*',
    'https://www.40code.com/*',
    'https://turbowarp.org/*',
    'https://codingclip.com/*',
    'https://editor.turbowarp.cn/*',
    'https://0832.ink/rc/*',
    'https://code.xueersi.com/scratch3/*',
    'https://play.creaticode.com/projects/*',
    'https://www.adacraft.org/*',
    'https://code.xueersi.com/home/project/detail?lang=scratch&pid=*&version=3.0&langType=scratch',
    'http://localhost:8601/*'
];

function pathFiltered () {
    const filtered = [];
    for (const originalUrl of includeURLs) {
        const urlObject = new URL(originalUrl);
        filtered.push(`${urlObject.origin}/*`);
    }
    return filtered;
}

module.exports = {
    includeURLs,
    pathFiltered
};
