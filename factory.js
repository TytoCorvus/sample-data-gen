const numeral = require('numeral');
const LoremIpsum = require('lorem-ipsum').LoremIpsum;

const factory = {};

const generateNumeral = (config) => {
    /**
     * Config attributes:
     * whole: boolean
     *      True values mean only whole numbers are generated
     * bounds: [ min, max ] 
     *      Two numbers defining the upper and lower bounds of the number to be generated
     * format: string
     *      A string defining the number format. Look at http://numeraljs.com for more info
     */

    const span = config.bounds ? config.bounds[1] - config.bounds[0] : 1;
    const min = config.bounds ? config.bounds[0] : 0;
    let rawNum = (Math.random() * span) + min;
    if(config.whole){
        rawNum = Math.floor(rawNum);
    }
    return config.format ? numeral(rawNum).format(config.format) : rawNum.toString();
}

const generateWord = (config) => {
    if(config.pool){
        return selectFromPool(config.pool);
    } else {
        const lorem = new LoremIpsum({});
        return lorem.generateWords(1);
    }
}

const generateArray = (config) => {
    return [];
}

const generateObject = (config) => {
    
}

const selectFromPool = (pool) => {
    return pool[Math.floor(Math.random() * pool.length)];
}

factory.construct = (config) => {
    let result = null;

    if(Array.isArray(config)){
        result = {};
        config.forEach( subConfig => {
            if(subConfig.optional && subConfig.frequency){
                if((Math.random() * 100) < subConfig.frequency) { 
                    result[subConfig.name] = factory.construct(subConfig);
                }
            } else {
                result[subConfig.name] = factory.construct(subConfig); 
            } 
        })
        return result;
    }

    switch(config.type){
        case "reference": 
            result = factory.construct(config.model);
            break;
        case "number": 
            result = generateNumeral(config);
            break;
        case "word":
            result = generateWord(config);
        default:
            break;
    }
    return result;
}

module.exports = factory;