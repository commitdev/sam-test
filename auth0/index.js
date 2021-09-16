const lib = require('./lib');
let data;

module.exports.handler = async (event, context, callback) => {
  try {
    data = await lib.authenticate(event);
  }
  catch (err) {
      console.log(err.stack);
      return context.fail(JSON.stringify(event))
      // return {
      //   isAuthorized: false,
      //   context: {
      //     err,
      //   }
      // };
  }
  console.log('success', data)
  return data;
};