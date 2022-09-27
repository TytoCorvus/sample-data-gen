const numeral = require('numeral');
const LoremIpsum = require('lorem-ipsum').LoremIpsum;

const factory = {};

const generateNumeral = (config) => {
    /**
     * Config attributes:
     * whole?: boolean
     *      True values mean only whole numbers are generated
     * bounds?: [ number, number ] 
     *      Two numbers defining the lower and upper bounds (respectively) of the number to be generated
     * format?: string
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
    /**
     * Config attributes:
     * pool?: Array<string>
     *      Array of values from which one will be selected randomly at a time (with replacement)
     */
    if(config.pool){
        return selectFromPool(config.pool);
    } else {
        const lorem = new LoremIpsum({});
        return lorem.generateWords(1);
    }
}

const generateSentence = (config) => {
    /**
     * Config attributes:
     * pool?: Array<string>
     *      Array of values from which one will be selected randomly at a time (with replacement)
     * length?: number | [ number, number ] = [ 5, 10 ]
     *      Number of words to be generated for the sentence. Length will be random between the two elements in the array if one is supplied.
     *      Item 0 is expected to be the min, Item 1 is expected to be the max.
     */
    let length;

    if(config.length && Array.isArray(config.length)){
        const span = config.length[1] - config.length[0];
        length = Math.floor(Math.random() * span) + config.length[0];
    } else if (config.length){
        length = config.length;
    } else {
        length = Math.floor(Math.random() * 5) + 5;
    }

    if(config.pool){
        result = [];
        for(var i = 0; i < length; i++){
            result.push(selectFromPool(config.pool));
        }
        return result.join(' ');
    } else {
        const lorem = new LoremIpsum({});
        return lorem.generateSentences({
            wordsPerSentence: {
                max: length,
                min: length
              }
        })
    }
}

const generateDate = (config) => {
    /**
     * Config attributes:
     *  dateMin: [yearMin: number, monthMin: number, dayMin: number]
     *  dateMax: [yearMax: number, monthMax: number, dayMin: number]
     */

    if(!config.dateMin || !config.dateMax){
        throw new Error('Date config provided without both dateMin and dateMax');
    }

    const dateMin = Number(new Date(...config.dateMin));
    const dateMax = Number(new Date(...config.dateMax));

    const resultDate = new Date(Math.random() * (dateMax - dateMin) + dateMin);
    return resultDate.toString();
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
        case "compound": 
            components = config.components.map( component => factory.construct(component) )
            result = components.join(config.separator ?? '');
            break;
        case "number": 
            result = generateNumeral(config);
            break;
        case "word":
            result = generateWord(config);
            break;
        case "sentence":
            result = generateSentence(config);
            break;
        case "date":
            result = generateDate(config);
            break;
        default:
            break;
    }
    return result;
}

module.exports = factory;