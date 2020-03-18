const fs = require('fs');
const path = require('path');

const servers = JSON.parse(fs.readFileSync(path.resolve(__dirname, './servers.json')));

const templated = (name, values = {}) => {
  let template = fs.readFileSync(path.resolve(__dirname, './templates', `./${name}.conf`), 'utf-8');
  for (const key in values) {
    template = template.replace(new RegExp(`{{${key}}}`, 'g'), values[key]);
  }
  return template;
};

const serverBlock = (server, contents) => {
  return templated('server', {
    serverName: server.name,
    contents: contents()
  });
};

const locationBlock = (location, contents) => {
  let modifier = '';
  let uri;

  if (location === '*') {
    uri = '/';
  } else {
    modifier = '=';
    uri = location;
  }

  return templated('location', {
    modifier,
    uri,
    contents: contents()
  });
};

const redirectBlock = (redirect) => {
  const code = redirect.statusCode || 301;

  let url = `$http_x_forwarded_proto://${redirect.to}`;
  if (!redirect.to.includes('/')) url += '$request_uri';

  return locationBlock(redirect.from, () => {
    return templated('redirect', {
      code,
      url
    });
  });
};

const proxyBlock = (proxy) => {
  return locationBlock(proxy.from, () => {
    return templated('proxy', {
      url: proxy.to
    });
  });
};

const wildcardLast = (rules) => {
  const index = rules.findIndex((rule) => rule.from === '*');
  if (index !== -1) {
    const wildcardRule = rules.splice(index, 1)[0];
    rules.push(wildcardRule);
  }
  return rules;
};

const serverConf = servers.map((server) => {
  return serverBlock(server, () => {
    const redirectBlocks = wildcardLast(server.redirect || []).map((redirect) => redirectBlock(redirect)).join('');
    const proxyBlocks = wildcardLast(server.proxy || []).map((proxy) => proxyBlock(proxy, server.name)).join('');
    return redirectBlocks + '\n' + proxyBlocks;
  });
}).join('');

const nginxConf = templated('nginx', {
  servers: serverConf
});

const confPath = path.resolve(__dirname, './nginx.conf');
fs.writeFileSync(confPath, nginxConf);

console.log(`NGINX config written to ${confPath}`);
