const dirTree = require("directory-tree");
const tree = dirTree("./apps", {
  extensions: /\.(njk|json)$/
});
const util = require('util');
const fs = require('fs');
const path = require('path');
const jsonfile = require("jsonfile");
const camelCase = require('camelcase');
import getUniqueId from "./get-unique-id";
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
      let appName = appNameMatch && appNameMatch[1];

      if (!templatePath.includes("/partials")) {

        let route = name === "home" ? "/" : "/" + name + "/:id?";

        pages.push({
          name: name,
          route: route,
          templateString: templateString,
          appName: camelCase(appName)
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

        if (remakeOptions.autoGenerateUniqueIds) {
          forEachDeep(startingData, function (value, key, parentValue, context) {
            if (isPlainObject(value) && !value.id) {
              value.id = getUniqueId();
            }
          });
        }

        partials.push({
          name: name,
          templateString: templateString,
          startingData: startingData,
          appName: camelCase(appName)
        });

      }

    }

  });

  return { pages, partials };

}

let appInfo = _getAppsInfo();

export { appInfo };





