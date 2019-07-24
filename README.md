# Get the app running

1. `npm install`
2. Rename the file `variables.env.example` to `variables.env` and fill it out
3. `npm run dev`
4. [enable livereload browser extension](https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei?hl=en)

**Important:** Don't just run `node server.js` because the front-end JS won't get transpiled. Use `npm run dev` instead.

<br/>

## Getting Started with Remake.js

- You're free to modify whatever you want. Add user accounts, play around with how the data is saved -- whatever! It's your project!
- However, the only files you should have to edit to get started in Remake.js are the templates and JSON files in the `./templates` folder.

### Pages

- The pages are defined in `./templates/pages`. They're automatically rendered based on the route that's defined in their `./templates/pages/{pageName}/config.json` file.

### Partials

- A good practice is to split your sub-templates off into partials and include them in the `./templates/partials` directory in their own folder. Then you can reference your partials from your page templates using a relative path.
- Also, partial templates defined in the `./templates/partials` directory will be automatically rendered for you when you use Remake's special `data-i-new` attribute, rendering them with the data that's in in their `./templates/partials/{partialName}/data.json` file.

### Templating

- This web app is server rendered (like all Remake.js web apps). It uses Nunjucks for the templating, which is very similar to Jinja. You can find the [docs for Nunjucks here](https://mozilla.github.io/nunjucks/templating.html).

## Warning

- This app doesn't implement real user accounts _yet_ (they're just simulated). You need to implement user accounts that have their own data yourself or wait for a version of Remake that has real user accounts built in. However, if you just want to play around with Remake.js, this is the perfect project to start with.
