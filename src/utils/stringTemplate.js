const _ = require('lodash');

function template(strings, ...keys) {
    return (function (...values) {
        let dict = values[values.length - 1] || {};
        let result = [strings[0]];
        keys.forEach(function (key, i) {
            let value = Number.isInteger(key) ? values[key] : _.get(dict,key);
            if(typeof(value) === 'undefined') value = '???';
            result.push(value, strings[i + 1]);
        });
        return result.join('');
    });
}

function fillTemplates(templates = [], values) {
    let ret_val = '';
    for (let t of templates) {
        if (typeof t === 'function')
            ret_val += t(values);
        else
            ret_val += t;
    }
    return ret_val;
}


module.exports = {
    fillTemplates,
    template
}
