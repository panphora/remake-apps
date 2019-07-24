const dirTree = require("directory-tree");
const tree = dirTree("./templates", {
  extensions: /\.(njk|json)$/
});
const util = require('util');
const fs = require('fs');
const path = require('path');
const readFile = util.promisify(fs.readFile);
const jsonfile = require("jsonfile");
const parseUrl = require('parseurl');
const nunjucks = require("nunjucks");
nunjucks.configure({ autoescape: true });
import { preProcessData } from "./pre-process-data";


async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

async function assemblePages () {
  let pages = [];
  let pagesData = tree.children.find(obj => obj.name === "pages").children;

  await asyncForEach(pagesData, async (pagesChild) => {
    let page = {};

    page.pageName = pagesChild.name; // e.g. "home"
    page.configPath = pagesChild.children.find(file => file.name === "config.json").path; // e.g. "home"
    page.templatePath = pagesChild.children.find(file => file.name === "index.njk").path; // e.g. "home"
    
    let configJson = await jsonfile.readFile(path.join(__dirname, "../", page.configPath), {encoding: "utf8"});
    page.route = configJson.route;
    page.title = configJson.title;

    let templateString = await readFile(path.join(__dirname, "../", page.templatePath), "utf8");
    page.templateString = templateString;
    
    pages.push(page);
  });

  return pages; // output: [{pageName, configPath, templatePath, route, title, templateString}]

}

export async function initRenderedRoutes ({app, writeAppDataToTempFiles, autoGenerateUniqueIds}) {
  let pages = await assemblePages();

  pages.forEach(({pageName, configPath, templatePath, route, title, templateString}) => {

    app.get(route, async (req, res) => {
      let params = req.params;
      let query = req.query;
      let pathname = parseUrl(req).pathname;
      let user = req.user;
      let flashErrors = req.flash("error");

      let data;
      let currentItem;
      if (user) {
        data = JSON.parse(user.appData);

        if (autoGenerateUniqueIds) {
          let processResponse = await preProcessData({data, user, params});
          currentItem = processResponse.currentItem;
        }
      }

      if (user && writeAppDataToTempFiles) {
        let formattedUsername = user.username.replace(/\W/g, "");
        jsonfile.writeFile(path.join(__dirname, `../tempData/${formattedUsername}.json`), data, { spaces: 2 }, function () {});
      }

      let html = nunjucks.render(templatePath, {
        title,
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







