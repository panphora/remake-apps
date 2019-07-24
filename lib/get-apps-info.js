const dirTree = require("directory-tree");
const tree = dirTree("./apps", {
  extensions: /\.(njk|json)$/
});
const util = require('util');
const fs = require('fs');
const path = require('path');
const readFile = util.promisify(fs.readFile);
const jsonfile = require("jsonfile");
const nunjucks = require("nunjucks");
nunjucks.configure({ autoescape: true });
import forEachDeep from "deepdash-es/forEachDeep";

export async function getAppsInfo () {
  let pages = [];
  let partials = [];

  await asyncForEachDeep(tree, async function (value, key, parent, context) {
    let templatePath = value.path;

    console.log(7, value);
    
    if (value.extension === ".njk") {

      console.log(8, value);

      let templateNameWithoutExtension = value.name.replace(value.extension, "");
      let templateString = await readFile(path.join(__dirname, "../", page.templatePath), "utf8");
      let appNameMatch = templatePath.match(/apps\/(\w+)/);
      let appName = appNameMatch && appNameMatch[1];

      if (!templatePath.includes("/partials")) {

        pages.push({
          name: templateNameWithoutExtension,
          route: "/" + name + "/:id?",
          templateString: templateString,
          appName: appName
        });

      } else {

        let pathToPartial = path.join(__dirname, "../" + templatePath);
        let pathToStartingData = templatePath.replace(".njk", ".json");
        let fullPathToStartingData = path.join(__dirname, "../" + pathToStartingData);

        let startingData;
        try {
          startingData = await jsonfile.readFile(fullPathToStartingData);
        } catch (e) {
          startingData = {};
        }

        let renderedHtml = nunjucks.render(pathToPartial, startingData);

        partials.push({
          name: templateNameWithoutExtension,
          renderedHtml: renderedHtml,
          appName: appName
        });

      }

    }

  });

  return { pages, partials };

}

// helpers

async function asyncForEachDeep(array, callback) {
  forEachDeep(async function (value, key, parent, context) {
    await callback(value, key, parent, context);
  });
}



