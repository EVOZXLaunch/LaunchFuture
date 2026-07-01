# LaunchFuture

Decentralized multi-chain token launch platform (currently live on EVOZ Mainnet).

## Development

Open `index.html` directly, or serve the folder with any static server. Note:
the production `<script src="./dist/launchfuture.bundle.js">` tag in
`index.html` requires a build first (see below). If you want to iterate
without building every time, temporarily swap that tag for
`<script type="module" src="./js/index.js"></script>` — but remember this
does NOT work inside wallet in-app browsers and must be reverted before
shipping.

## Production Build

Wallet in-app browsers (MetaMask Mobile, TokenPocket, imToken, OKX, Bitget,
Rabby, etc.) run WebViews that frequently fail to load
`<script type="module">` and cannot reliably fetch remote ES-module imports
(e.g. the previous `https://esm.sh/ethers@6` import). To fix this, the app
is bundled into a single classic script with esbuild:

```bash
npm install
npm run build     # -> dist/launchfuture.bundle.js
```

`index.html` already points at `dist/launchfuture.bundle.js`. Just make sure
you run the build before deploying, or let CI do it for you (see below).

## Deployment (GitHub Pages)

`.github/workflows/deploy.yml` builds the bundle and deploys automatically
on every push to `main`. Enable it once in your repo:
**Settings → Pages → Source → GitHub Actions**.

`dist/` is intentionally excluded from git (see `.gitignore`) — it is
always generated fresh by the build step, both locally and in CI.

## Testing on wallet in-app browsers

After deploying, test the live URL directly inside MetaMask Mobile's
built-in browser, TokenPocket, and at least one other wallet before
announcing a launch. Desktop-browser testing alone is not sufficient.
