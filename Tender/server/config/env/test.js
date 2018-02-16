export default {
  env: 'test',
  jwtSecret: '0a6b944d-d2fb-46fc-a85e-0295c986cd9f',
  jwtExpiresIn: '24h',
  db: 'mongodb://localhost/test',
  apn: {
    key: './key_prod.pem',
    cert: './cert_prod.pem',
    production: true,
    passphrase: '1234',
    gateway: 'gateway.push.apple.com',
  },
  url: '192.168.200.18',
  port: 4044,
  s3_url: 'https://s3.ap-south-1.amazonaws.com/tenderwatch',
  googleAuthClient: '153589139177-l8sv2dg83p34nh4t07ebbvegv100p1fj.apps.googleusercontent.com',
  supportId: '5981bc34b5fb605c7406d446'
};
