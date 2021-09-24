'use strict';
exports.handler = function(event, context) {
  console.log('event', event)
  let response = {
    statusCode:  401,
    body: JSON.stringify('Unauthorized to set cookie')
  };
  if (event.routeKey == "GET /whoami") {
    response = {
      statusCode: 200,
      body:  JSON.stringify(event.requestContext?.authorizer?.lambda)
    };

  } else if (event.routeKey == "POST /authorize") {
    // Cookie expiry settings
    const cookie_expiry = parseInt(process.env.COOKIE_TTL_SECONDS) || 3600
    var date = new Date();
    // date.setTime(+ date + (cookie_expiry * 1000));
    date.setTime(+ date + (2 * 86400000)); //24 * 60 * 60 * 100

    // build token string
    const tokenRegex = new RegExp(/bearer[\s]+([A-Za-z0-9-_]*\.[A-Za-z0-9-_]*\.[A-Za-z0-9-_]*$)/i)
    const [success, token] = event.headers.authorization.match(tokenRegex);
    var cookieString = `sam_token=${token}; domain=sam.zero-david.xyz; path=/; expires=${date.toGMTString()}; samesite=none; HttpOnly; secure`;

    response = {
      statusCode:  200,
      headers : {"Set-Cookie": cookieString},
      body:  JSON.stringify('User profile set successfully')
    };
  }
  context.done(null, response);
};