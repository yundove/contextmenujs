var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
function getProperty(options, opt, def) {
  return isDefined(options[opt]) ? options[opt] : def;
}
function getSizes(obj) {
  const liArr = Array.from(obj.getElementsByTagName("li"));
  let widthDef = 0;
  let heightDef = 0;
  for (const li of liArr) {
    widthDef = Math.max(li.offsetWidth, widthDef);
    heightDef = Math.max(li.offsetHeight, heightDef);
  }
  let width = widthDef;
  let height = heightDef;
  for (const li of liArr) {
    const ul = li.getElementsByTagName("ul");
    const firstUl = ul[0];
    if (isDefined(firstUl)) {
      const ulSize = getSizes(firstUl);
      width = Math.max(widthDef + ulSize.width, width);
      height = Math.max(heightDef + ulSize.height, height);
    }
  }
  return { width, height };
}
function isUndefined(obj) {
  return typeof obj === "undefined";
}
function isDefined(obj) {
  return !isUndefined(obj);
}
function isObject(obj) {
  return obj !== null && typeof obj === "object";
}
var ContextMenuItemType;
(function(ContextMenuItemType2) {
  ContextMenuItemType2["MENU_DIVIDER"] = "cm_divider";
})(ContextMenuItemType || (ContextMenuItemType = {}));
let nanoid = (size = 21) => {
  let id = "";
  let bytes = crypto.getRandomValues(new Uint8Array(size));
  while (size--) {
    let byte = bytes[size] & 63;
    if (byte < 36) {
      id += byte.toString(36);
    } else if (byte < 62) {
      id += (byte - 26).toString(36).toUpperCase();
    } else if (byte < 63) {
      id += "_";
    } else {
      id += "-";
    }
  }
  return id;
};
class ContextMenu {
  constructor(menu, options) {
    __publicField(this, "instance_id");
    __publicField(this, "context_target");
    __publicField(this, "menu", []);
    __publicField(this, "options", {});
    this.onDocumentClick = this.onDocumentClick.bind(this);
    this.onWindowResize = this.onWindowResize.bind(this);
    this.instance_id = `cm_${nanoid()}`;
    if (!(menu instanceof Array)) {
      throw new Error("Parameter 1 must be of type Array");
    }
    this.menu = menu;
    if (isDefined(options)) {
      if (!isObject(options)) {
        throw new Error("Parameter 2 must be of type object");
      }
      this.options = options;
    }
    window.addEventListener("resize", this.onWindowResize);
    this.reload();
  }
  onWindowResize() {
    if (getProperty(this.options, "close_on_resize", true)) {
      this.hide();
    }
  }
  setOptions(options) {
    if (isObject(options)) {
      this.options = options;
    } else {
      throw new Error("Parameter 1 must be of type object");
    }
  }
  changeOption(option, value) {
    if (typeof option === "string") {
      if (isDefined(value)) {
        this.options[option] = value;
      } else {
        throw new Error("Parameter 2 must be set");
      }
    } else {
      throw new Error("Parameter 1 must be of type string");
    }
  }
  getOptions() {
    return this.options;
  }
  reload() {
    const menu = this.menu;
    if (this.dom === null) {
      this.addDom();
    }
    const container = this.dom;
    container.innerHTML = "";
    container.appendChild(this.renderLevel(menu));
  }
  display(e, target) {
    const options = this.options;
    this.context_target = isDefined(target) ? target : e.target;
    const menu = this.dom;
    const clickCoords = { x: e.clientX, y: e.clientY };
    const clickCoordsX = clickCoords.x;
    const clickCoordsY = clickCoords.y;
    const menuWidth = menu.offsetWidth + 4;
    const menuHeight = menu.offsetHeight + 4;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const mouseOffset = parseInt(getProperty(options, "mouse_offset", 2));
    if (windowWidth - clickCoordsX < menuWidth) {
      menu.style.left = `${windowWidth - menuWidth}px`;
    } else {
      menu.style.left = `${clickCoordsX + mouseOffset}px`;
    }
    if (windowHeight - clickCoordsY < menuHeight) {
      menu.style.top = `${windowHeight - menuHeight}px`;
    } else {
      menu.style.top = `${clickCoordsY + mouseOffset}px`;
    }
    const sizes = getSizes(menu);
    if (windowWidth - clickCoordsX < sizes.width) {
      menu.classList.add("cm_border_right");
    } else {
      menu.classList.remove("cm_border_right");
    }
    if (windowHeight - clickCoordsY < sizes.height) {
      menu.classList.add("cm_border_bottom");
    } else {
      menu.classList.remove("cm_border_bottom");
    }
    menu.classList.add("display");
    if (getProperty(options, "close_on_click", true)) {
      window.addEventListener("click", this.onDocumentClick);
    }
    e.preventDefault();
  }
  hide() {
    var _a;
    (_a = this.dom) == null ? void 0 : _a.classList.remove("display");
    window.removeEventListener("click", this.onDocumentClick);
  }
  get dom() {
    const id = this.instance_id;
    return document.getElementById(id);
  }
  addDom() {
    const id = this.instance_id;
    const dom = document.createElement("div");
    dom.className = "cm_container";
    dom.id = id;
    document.body.appendChild(dom);
  }
  onDocumentClick() {
    this.hide();
  }
  renderLevel(level) {
    const options = this.options;
    const ulOuter = document.createElement("ul");
    level.forEach((item) => {
      const li = document.createElement("li");
      if (isUndefined(item.type)) {
        const iconSpan = document.createElement("span");
        iconSpan.className = "cm_icon_span";
        if (getProperty(item, "icon", "") !== "") {
          iconSpan.innerHTML = getProperty(item, "icon", "");
        } else {
          iconSpan.innerHTML = getProperty(options, "default_icon", "");
        }
        const textSpan = document.createElement("span");
        textSpan.className = "cm_text";
        if (getProperty(item, "text", "") !== "") {
          textSpan.innerHTML = getProperty(item, "text", "");
        } else {
          textSpan.innerHTML = getProperty(this.options, "default_text", "item");
        }
        const subSpan = document.createElement("span");
        subSpan.className = "cm_sub_span";
        if (typeof item.sub !== "undefined") {
          if (getProperty(options, "sub_icon", "") !== "") {
            subSpan.innerHTML = getProperty(this.options, "sub_icon", "");
          } else {
            subSpan.innerHTML = "&#155;";
          }
        }
        li.appendChild(iconSpan);
        li.appendChild(textSpan);
        li.appendChild(subSpan);
        if (!getProperty(item, "enabled", true)) {
          li.setAttribute("disabled", "");
        } else {
          if (typeof item.events === "object") {
            const keys = Object.keys(item.events);
            for (let i = 0; i < keys.length; i++) {
              li.addEventListener(keys[i], item.events[keys[i]]);
            }
          }
          if (typeof item.sub !== "undefined") {
            li.appendChild(this.renderLevel(item.sub));
          }
        }
      } else {
        if (item.type === ContextMenuItemType.MENU_DIVIDER) {
          li.className = ContextMenuItemType.MENU_DIVIDER;
        }
      }
      ulOuter.appendChild(li);
    });
    return ulOuter;
  }
}
export { ContextMenu as default };
