const parseUrl = require('parseurl');
import { getAppsInfo } from "./get-apps-info";
const path = require('path');
const jsonfile = require("jsonfile");
import { nunjucks } from "./nunjucks-lib";
import { preProcessData } from "./pre-process-data";
import { remakeOptions } from "./remake-options";

export async function initRenderedRoutes ({app, writeAppDataToTempFiles}) {

  let pages = getAppsInfo().pages;

  pages.forEach(({name, route, templateString, appName}) => {

    app.get(route, async (req, res) => {

      let params = req.params;
      let query = req.query;
      let pathname = parseUrl(req).pathname;
      let user = req.user;
      let flashErrors = req.flash("error");

      let data;
      let currentItem;
      let parentItem; 
      if (user && !appName.startsWith("_")) {
        data = JSON.parse(user.appData[appName] || user.appData["default"]);

        if (remakeOptions.autoGenerateUniqueIds) {
          let processResponse = await preProcessData({data, user, params, appName});
          currentItem = processResponse.currentItem;
          parentItem = processResponse.parentItem;
        }
      }

      if (params.id && !currentItem) {
        res.status(404).send("404 Not Found");
      }

      let html = nunjucks.renderString(templateString, {
        data,
        params,
        query,
        pathname,
        currentItem,
        parentItem,
        flashErrors,
        user
      });

      if (!appName.startsWith("_")) {
        html = html.replace("<body", `<body data-app="${appName}"`);
      }

      res.send(html);

    });

  });

}







