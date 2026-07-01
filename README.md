# LaunchFuture

Decentralized multi-chain token launch platform (currently live on EVOZ Mainnet).

## Deploying

No build step, no npm, no CLI needed. Just upload/push every file in this
folder to your GitHub repository exactly as-is, then enable GitHub Pages:

**Settings → Pages → Source → Deploy from a branch → `main` / `(root)`**

That's it — `index.html` loads everything it needs directly.

## Why the scripts changed

The app used to load `js/index.js` as an ES module
(`<script type="module">`) and pulled the `ethers` library from a remote
ES-module CDN. That combination frequently fails inside wallet in-app
browsers (MetaMask Mobile, TokenPocket, imToken, OKX, Bitget, Rabby, etc.),
because those WebViews are inconsistent about loading `type="module"`
scripts and nested ES-module imports.

To fix this, every file in `js/` is now a **plain classic script** (no
`type="module"`) that attaches its functions to a shared `window.LF`
object instead of using `import`/`export`. `ethers` is loaded the same
way, from its official UMD build, as a global `ethers` object. Classic
scripts work in every browser and every wallet WebView with zero build
tooling.

**Important:** the `<script>` tags near the bottom of `index.html` must
stay in their current order — each file depends on globals set by the
ones before it. Don't reorder them, and don't add `type="module"` back.

## Testing before you launch

Always test the live GitHub Pages URL directly inside a few wallet
in-app browsers (MetaMask Mobile's built-in browser, TokenPocket, etc.),
not just a desktop browser, before announcing a token launch.

## Note on unused files

`js/utils.js` and `js/review.js` exist in the repo but are not loaded by
`index.html` — nothing in the app currently uses them. They're left as
plain ES modules in case you want to wire them in later; if you do,
they'll need the same classic-script treatment described above.
