const fs = require('fs');
const { construct } = require('./factory');

const args = process.argv;

if( args.length < 3 ){
    console.log(`You didn't provide enough arguments:`)
    console.log(`<config file path> <outfile path> <number to generate>`)
    process.exit();
}

const config = require(args[2]),
        outFilePath = args[3] ?? 'outfile.json',
        toGenerate = args[4] ?? 1;

// TODO: Run a Depth First search on the config - 
//  if any config is in the path more than once for any leaf, it HAS to be invalid to avoid cyclical dependencies

const result = [];

for(var i = 0; i < toGenerate; i++){
    result.push(construct(config));
}

fs.writeFileSync(outFilePath, JSON.stringify(result));
console.log(`Job completed - ${outFilePath} has been written with ${toGenerate} item${toGenerate > 1 ? 's' : ''}.`);