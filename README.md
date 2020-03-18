# redirector-gateway
Redirector gateway using NGINX on Cloud Foundry

## Configuration

Create a servers.json file with entries for each server this gateway needs to
handle traffic for.

### servers.json
The servers.json configuration file is structured as a JSON array with one
entry for each server:
```json
[
  {
    "name": "redirect.example.org",
    "redirect": [
      { "from": "...", "to": "..." },
      { "from": "...", "to": "..." }
    ]
  },
  {
    "name": "proxy.eanadev.org",
    "proxy": [
      { "from": "...", "to": "..." },
      { "from": "...", "to": "..." }
    ]
  }
]
```

#### Redirects

##### http/https

Redirect targets in the `to` property must not include http:// or https://.
The scheme used in the incoming request will be preserved in the redirect.

##### Redirect all paths to another host, preserving URL path

To redirect from redirect.example.org to other.example.org, preserving the path
in the URL, use the wildcard `*` in the `to` property, and set only the
hostname in the redirect's `to` property:
```json
{
  "name": "redirect.example.org",
  "redirect": [
    { "from": "*", "to": "other.example.org" }
  ]
}
```
For example:
* redirect.example.org/a will redirect to other.example.org/a
* redirect.example.org/b will redirect to other.example.org/b
* redirect.example.org/c will redirect to other.example.org/c

##### Redirect all paths to one URL

To redirect all paths to another URL, regardless of the requested path, use the
wildcard `*` in the `to` property, and include a `/` in the `to` property:
```json
{
  "name": "redirect.example.org",
  "redirect": [
    { "from": "*", "to": "other.example.org/about" }
  ]
}
```
For example:
* redirect.example.org/a will redirect to other.example.org/about
* redirect.example.org/b will redirect to other.example.org/about
* redirect.example.org/c will redirect to other.example.org/about

##### Redirect one path to one URL

To redirect just a single path to a single URL, set that path in the `from`
property and the URL in the `to` property.
```json
{
  "name": "redirect.example.org",
  "redirect": [
    { "from": "/a", "to": "other.example.org/about" },
    { "from": "/b", "to": "other.example.org/bots" }
  ]
}
```
For example:
* redirect.example.org/a will redirect to other.example.org/about
* redirect.example.org/b will redirect to other.example.org/bots

##### Redirection status code

All redirects will by default use status code 301. To customise that per-rule,
use the `statusCode` property:
```json
{
  "name": "redirect.example.org",
  "redirect": [
    { "from": "*", "to": "other.example.org/about", "statusCode": 302 }
  ]
}
```

#### Proxies

To proxy requests to another server:
```json
{
  "name": "proxy.example.org",
  "proxy": [
    { "from": "*", "to": "https://other.example.org/api" }
  ]
}
```
For example:
* proxy.example.org/a will be proxied to https://other.example.org/api/a
* proxy.example.org/b will be proxied to https://other.example.org/api/b

## Usage

To build the NGINX configuration from servers.json, ready to push to Cloud
Foundry:
```
npm run build
```

## License

Licensed under the EUPL v1.2.

For full details, see [LICENSE.md](LICENSE.md).
