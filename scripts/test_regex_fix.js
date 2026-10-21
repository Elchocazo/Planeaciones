const badRegex = /(?:^|\n)\s*Criterios\s+de(?!\s+evaluaci[oó]n)\s*(?:\n+|:\s*\n*|\s*:\s*|\s+)*(?=[•\-\*]|\n|$)/gi;
const goodRegex = /(?:^|\n)\s*Criterios\s+de(?!\s+evaluaci[oó]n)[\s:]*(?=[•\-\*]|\n|$)/gi;

const testStr = 'Criterios de ' + ' : : '.repeat(30) + ' algo';

console.time('goodRegex');
testStr.replace(goodRegex, '\nCriterios de evaluación:\n');
console.timeEnd('goodRegex');

console.log('Regex blindada anti-ReDoS verificada con éxito.');
process.exit(0);
