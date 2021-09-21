require('dotenv').config({ silent: true });

const jwksClient = require('jwks-rsa');
const jwt = require('jsonwebtoken');
const util = require('util');

// const getPolicyDocument = (effect, resource) => {
//     const policyDocument = {
//         Version: '2012-10-17', // default version
//         Statement: [{
//             Action: 'execute-api:Invoke', // default action
//             Effect: effect,
//             Resource: resource,
//         }]
//     };
//     return policyDocument;
// }

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
    tokenString = params.headers.authorization;
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
          /*** 
           * {
                principalId: decoded.sub,
                policyDocument: getPolicyDocument('Allow', params.methodArn),
                context: { scope: decoded.scope }
            }
           */
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

