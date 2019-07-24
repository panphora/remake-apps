import './js/user-cookies';
import './js/accounts';
import { init, getDataFromRootNode, callSaveFunction } from 'remakejs/dist/bundle.es6';
import Sortable from 'sortablejs';

// init remake
init({
  addItemCallback: function ({itemElem, templateName}) {
    if (templateName === "stack") {
      let stackElem = itemElem;

      let sortable = Sortable.create(stackElem.querySelector(".tacks"), {
        group: "tacks",
        onEnd: function (event) {
          callSaveFunction({targetElement: stackElem})
        }
      });
    }
  }
});


// tacks sortable init

let tacksListElems = document.querySelectorAll('.tacks');
Array.from(tacksListElems).forEach(tacksListElem => {
  let sortable = Sortable.create(tacksListElem, {
    group: "tacks",
    onEnd: function (event) {
      callSaveFunction({targetElement: tacksListElem})
    }
  });
});

// stacks sortable init

let stacksListElem = document.querySelector(".stacks");
if (stacksListElem) {
  Sortable.create(stacksListElem, {
    group: "stacks",
    onEnd: function (event) {
      callSaveFunction({targetElement: stacksListElem})
    }
  });
}


window.getDataFromRootNode = getDataFromRootNode;













