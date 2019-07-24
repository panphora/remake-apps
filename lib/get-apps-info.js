const dirTree = require("directory-tree");
const tree = dirTree("./apps", {
  extensions: /\.(njk|json)$/
});
const util = require('util');
const fs = require('fs');
const path = require('path');
const jsonfile = require("jsonfile");
const nunjucks = require("nunjucks");
nunjucks.configure({ autoescape: true });
import forEachDeep from "deepdash-es/forEachDeep";

export function getAppsInfo () {
  let pages = [];
  let partials = [];

  forEachDeep(tree, function (value, key, parent, context) {
    let templatePath = value.path;
    
    if (value.extension === ".njk") {

      let templateNameWithoutExtension = value.name.replace(value.extension, "");
      let templateString = fs.readFileSync(path.join(__dirname, "../", value.path), "utf8");
      let appNameMatch = templatePath.match(/apps\/(\w+)/);
      let appName = appNameMatch && appNameMatch[1];

      if (!templatePath.includes("/partials")) {

        pages.push({
          name: templateNameWithoutExtension,
          route: "/" + appName + "/:id?",
          templateString: templateString,
          appName: appName
        });

      } else {

        let pathToPartial = path.join(__dirname, "../", templatePath);
        let pathToStartingData = templatePath.replace(".njk", ".json");
        let fullPathToStartingData = path.join(__dirname, "../", pathToStartingData);

        let startingData;
        try {
          startingData = jsonfile.readFileSync(fullPathToStartingData);
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



