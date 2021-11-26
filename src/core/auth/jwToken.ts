import jwt, { TokenExpiredError } from 'jsonwebtoken';

const TOKEN_SECRET = "87`'9zMh3VCQzsE8";
const TOKEN_EXPIRE = '1h';
const TOKEN_REFRESH = '2m';

export interface AccessTokenData {
  session: string;
}

interface TokenData {
  session: string;
  iat: number;
  exp: number;
}

export const generateAccessToken = (user: AccessTokenData) => {
  return jwt.sign(user, TOKEN_SECRET, { expiresIn: TOKEN_EXPIRE, jwtid: TOKEN_REFRESH });
};

export const verifyAccessToken = (res: any, token: string): AccessTokenData | undefined => {
  try {
    if (!token || token === 'null') return undefined;
    const data = jwt.verify(token, TOKEN_SECRET) as TokenData;
    const now = Math.trunc(new Date().getTime() / 1000);
    // console.log(data, data.exp - now, now, data.iat);
    if (data.exp - 30 * 60 < now) {
      let newData = <AccessTokenData>{};
      newData.session = data.session;
      const newToken = generateAccessToken(newData);
      res.header('Access-Control-Expose-Headers', 'refreshToken');
      res.header('refreshToken', newToken);
    }
    return Object.assign(<AccessTokenData>{}, data);
  } catch (err) {
    // TokenExpiredError
    // console.error((err as TokenExpiredError).message);
    return undefined;
  }
};
