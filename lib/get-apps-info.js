const dirTree = require("directory-tree");
const tree = dirTree("./apps", {
  extensions: /\.(njk|json)$/
});
const util = require('util');
const fs = require('fs');
const path = require('path');
const jsonfile = require("jsonfile");
const camelCase = require('camelcase');
import { nunjucks } from "./nunjucks-lib";
import forEachDeep from "deepdash-es/forEachDeep";
import { remakeOptions } from "./remake-options";
import { isPlainObject } from 'lodash-es';

function _getAppsInfo () {
  let pages = [];
  let partials = [];

  forEachDeep(tree, function (value, key, parent, context) {
    let templatePath = value.path;
    
    if (value.extension === ".njk") {

      let name = value.name.replace(value.extension, "");
      let templateString = fs.readFileSync(path.join(__dirname, "../", templatePath), "utf8");
      let appNameMatch = templatePath.match(/apps\/([\w-]+)/);
      let tempAppName = appNameMatch && appNameMatch[1];
      let appName = tempAppName.startsWith("_") ? "_" + camelCase(tempAppName) : camelCase(tempAppName);

      if (!templatePath.includes("/partials")) {
        // `value` is a page

        let route = name === "home" ? "/" : "/" + name + "/:id?";

        let existingPage = pages.find(p => p.name === name);

        if (existingPage) {
          console.log("\x1b[31m", `WARNING: You have more than one page with the name: "${name}"`);
        }

        pages.push({
          name: name,
          route: route,
          templateString: templateString,
          appName: appName
        });

      } else {

        let templateString = fs.readFileSync(path.join(__dirname, "../", templatePath), "utf8");
        let pathToStartingData = templatePath.replace(".njk", ".json");
        let fullPathToStartingData = path.join(__dirname, "../", pathToStartingData);

        let startingData;
        try {
          startingData = jsonfile.readFileSync(fullPathToStartingData);
        } catch (e) {
          startingData = {};
        }

        partials.push({
          name: name,
          templateString: templateString,
          startingData: startingData,
          appName: appName
        });

      }

    }

  });

  return { pages, partials };

}

let appInfo = _getAppsInfo();

export function getAppsInfo () {
  // return a new copy every time
  return JSON.parse(JSON.stringify(appInfo));
}




