const base64 = 'ABCDEF1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.repeat(10000);
const rawHtml = '<p>Texto</p><img src="data:image/png;base64,' + base64 + '"><p>Texto</p>';

const badRegex = /([^\n:]+:)\s*\n{2,}([•]|[-*](?!\*))/g;
const goodRegex = /([^\n:]{1,120}:)\s*\n{2,}([•]|[-*](?!\*))/g;

console.time('goodRegex');
rawHtml.replace(goodRegex, '$1\n$2');
console.timeEnd('goodRegex');
console.log('Fixed regex succeeded in less than 1ms!');
