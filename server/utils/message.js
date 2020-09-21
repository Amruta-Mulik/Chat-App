const moment = require('moment');

let generateMessage = (from, text) => {
    return {
        from,
        text,
        createdAt: moment().valueOf()
    };
};

let validInputs = (str) => {
    return typeof str === 'string' && str.trim().length > 0;
  };

module.exports = {generateMessage, validInputs};