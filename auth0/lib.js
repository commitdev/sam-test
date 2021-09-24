require('dotenv').config({ silent: true });

const jwksClient = require('jwks-rsa');
const jwt = require('jsonwebtoken');
const util = require('util');

const client = jwksClient({
  cache: true,
  rateLimit: true,
  jwksRequestsPerMinute: 10, // Default value
  jwksUri: process.env.JWKS_URI
});

// extract and return the Bearer Token from the Lambda event parameters
const getToken = (params) => {
  let tokenString = undefined;
  if (params.type === "REQUEST") {
    const cookieName = process.env.COOKIE_NAME;
    const foundValueFromCookie = cookieName && params.identitySource.find(i=>i.indexOf(`${cookieName}=`)>=0)
    if (foundValueFromCookie) {
      return foundValueFromCookie.substr(cookieName.length+1)
    } else {
      // get from header

      tokenString = params.headers.authorization;
    }
    
  }
  // else if (params.type === "TOKEN") {
  //   tokenString = params.authorizationToken;
  // }
  if (!tokenString) {
    throw new Error("Token must be provided.")
  }
  const match = tokenString.match(/^Bearer (.*)$/);
  if (!match || match.length < 2) {
      throw new Error(`Invalid Authorization token - ${tokenString} does not match Bearer .*`);
  }
  return match[1];
}

const jwtOptions = {
    audience: process.env.AUDIENCE,
    issuer: process.env.TOKEN_ISSUER
};

module.exports.authenticate = (params) => {
    console.log(params);
    const token = getToken(params);

    const decoded = jwt.decode(token, { complete: true });
    if (!decoded || !decoded.header || !decoded.header.kid) {
        throw new Error('invalid token');
    }

    const getSigningKey = util.promisify(client.getSigningKey);
    return getSigningKey(decoded.header.kid)
        .then((key) => {
            const signingKey = key.publicKey || key.rsaPublicKey;
            return jwt.verify(token, signingKey, jwtOptions);
        })
        .then((decoded)=> {
          console.log(decoded)
          return {
            isAuthorized : true,
            context: {
              id: decoded.sub,
              name: decoded.name,
              email: decoded.email,
            }
          }
        });
}

