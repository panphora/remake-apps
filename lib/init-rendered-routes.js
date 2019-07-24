const parseUrl = require('parseurl');
import { appInfo } from "./get-apps-info";
const path = require('path');
const jsonfile = require("jsonfile");
import { nunjucks } from "./nunjucks-lib";
import { preProcessData } from "./pre-process-data";

export async function initRenderedRoutes ({app, writeAppDataToTempFiles, autoGenerateUniqueIds}) {

  let pages = appInfo.pages;

  pages.forEach(({name, route, templateString, appName}) => {

    app.get(route, async (req, res) => {

      let params = req.params;
      let query = req.query;
      let pathname = parseUrl(req).pathname;
      let user = req.user;
      let flashErrors = req.flash("error");

      let data;
      let currentItem;
      if (user) {
        data = JSON.parse(user.appData[appName] || "{}");

        if (autoGenerateUniqueIds) {
          let processResponse = await preProcessData({data, user, params, appName});
          currentItem = processResponse.currentItem;
        }
      }

      if (user && writeAppDataToTempFiles) {
        let formattedUsername = user.username.replace(/\W/g, "");
        jsonfile.writeFile(path.join(__dirname, `../tempData/${formattedUsername}-${appName}.json`), data, { spaces: 2 }, function () {});
      }

      let html = nunjucks.renderString(templateString, {
        data,
        params,
        query,
        pathname,
        currentItem,
        flashErrors,
        user
      });

      res.send(html);

    });

  });

}







