import { getProperty, getSizes, isDefined, isObject, isUndefined } from './utils'
import { ContextMenuItemType } from './constants'
import { nanoid } from 'nanoid'

export interface CommonJSONObject {
  [key: string]: any
}

interface ContextMenuItem extends CommonJSONObject{
  text?: string
  icon?: string
  sub?: ContextMenu[]
  type?: string
  events?: {
    click?: (e: MouseEvent) => {}
    mouseover?: (e: MouseEvent) => {}
  }
}

type ContextMenuItems = ContextMenuItem[]

interface ContextMenuOptions {
  close_on_resize?: boolean
  close_on_click?: boolean
  default_icon?: string
  default_text?: string
  sub_icon?: string
  mouse_offset?: number
}

type ContextMenuOption = keyof ContextMenuOptions

export class ContextMenu {
  instance_id: string
  context_target: EventTarget | null | undefined
  menu: ContextMenuItems = []
  options: ContextMenuOptions = {}

  constructor (menu: unknown, options: unknown) {
    this.onDocumentClick = this.onDocumentClick.bind(this)
    this.onWindowResize = this.onWindowResize.bind(this)

    this.instance_id = `cm_${nanoid()}`

    if (!(menu instanceof Array)) {
      throw new Error('Parameter 1 must be of type Array')
    }
    this.menu = menu

    if (isDefined(options)) {
      if (!isObject(options)) {
        throw new Error('Parameter 2 must be of type object')
      }
      this.options = options as ContextMenuOptions
    }

    window.addEventListener('resize', this.onWindowResize)
    this.reload()
  }

  onWindowResize () {
    if (getProperty(this.options as CommonJSONObject, 'close_on_resize', true)) {
      this.hide()
    }
  }

  setOptions (options: unknown) {
    if (isObject(options)) {
      this.options = options as ContextMenuOptions
    } else {
      throw new Error('Parameter 1 must be of type object')
    }
  };

  changeOption (option: unknown, value: any) {
    if (typeof option === 'string') {
      if (isDefined(value)) {
        this.options[option as ContextMenuOption] = value
      } else {
        throw new Error('Parameter 2 must be set')
      }
    } else {
      throw new Error('Parameter 1 must be of type string')
    }
  };

  getOptions () {
    return this.options
  };

  reload () {
    const menu = this.menu
    if (this.dom == null) {
      this.addDom()
    }

    const container = this.dom
    container!.innerHTML = ''
    container!.appendChild(this.renderLevel(menu))
  };

  display (e: MouseEvent, target?: EventTarget) {
    const self = this

    const options = self.options
    self.context_target = isDefined(target) ? target : e.target

    const menu = this.dom!
    const clickCoords = { x: e.clientX, y: e.clientY }
    const clickCoordsX = clickCoords.x
    const clickCoordsY = clickCoords.y
    const menuWidth = menu.offsetWidth + 4
    const menuHeight = menu.offsetHeight + 4
    const windowWidth = window.innerWidth
    const windowHeight = window.innerHeight
    const mouseOffset = parseInt(getProperty(options, 'mouse_offset', 2) as string)

    if (windowWidth - clickCoordsX < menuWidth) {
      menu.style.left = windowWidth - menuWidth + 'px'
    } else {
      menu.style.left = clickCoordsX + mouseOffset + 'px'
    }

    if (windowHeight - clickCoordsY < menuHeight) {
      menu.style.top = windowHeight - menuHeight + 'px'
    } else {
      menu.style.top = clickCoordsY + mouseOffset + 'px'
    }

    const sizes = getSizes(menu)

    if (windowWidth - clickCoordsX < sizes.width) {
      menu.classList.add('cm_border_right')
    } else {
      menu.classList.remove('cm_border_right')
    }

    if (windowHeight - clickCoordsY < sizes.height) {
      menu.classList.add('cm_border_bottom')
    } else {
      menu.classList.remove('cm_border_bottom')
    }

    menu.classList.add('display')

    if (getProperty(options, 'close_on_click', true)) {
      window.addEventListener('click', this.onDocumentClick)
    }

    e.preventDefault()
  };

  hide () {
    this.dom?.classList.remove('display')
    window.removeEventListener('click', this.onDocumentClick)
  }

  get dom () {
    const id = this.instance_id
    return document.getElementById(id)
  }

  addDom () {
    const id = this.instance_id
    const dom = document.createElement('div')
    dom.className = 'cm_container'
    dom.id = id
    document.body.appendChild(dom)
  }

  onDocumentClick () {
    this.hide()
  }

  renderLevel (level: ContextMenuItems) {
    const self = this
    const options = self.options
    const ul_outer = document.createElement('ul')
    level.forEach(function (item) {
      const li = document.createElement('li')

      if (isUndefined(item.type)) {
        const icon_span = document.createElement('span')
        icon_span.className = 'cm_icon_span'

        if (getProperty(item, 'icon', '') != '') {
          icon_span.innerHTML = getProperty(item, 'icon', '') as string
        } else {
          icon_span.innerHTML = getProperty(options, 'default_icon', '') as string
        }

        const text_span = document.createElement('span')
        text_span.className = 'cm_text'

        if (getProperty(item, 'text', '') != '') {
          text_span.innerHTML = getProperty(item, 'text', '') as string
        } else {
          text_span.innerHTML = getProperty(self.options, 'default_text', 'item') as string
        }

        const sub_span = document.createElement('span')
        sub_span.className = 'cm_sub_span'

        if (typeof item.sub !== 'undefined') {
          if (getProperty(options, 'sub_icon', '') != '') {
            sub_span.innerHTML = getProperty(self.options, 'sub_icon', '') as string
          } else {
            sub_span.innerHTML = '&#155;'
          }
        }

        li.appendChild(icon_span)
        li.appendChild(text_span)
        li.appendChild(sub_span)

        if (!getProperty(item, 'enabled', true)) {
          li.setAttribute('disabled', '')
        } else {
          if (typeof item.events === 'object') {
            const keys = Object.keys(item.events) as never[]

            for (let i = 0; i < keys.length; i++) {
              li.addEventListener(keys[i], item.events[keys[i]])
            }
          }

          if (typeof item.sub !== 'undefined') {
            li.appendChild(self.renderLevel(item.sub))
          }
        }
      } else {
        if (item.type == ContextMenuItemType.MENU_DIVIDER) {
          li.className = ContextMenuItemType.MENU_DIVIDER
        }
      }

      ul_outer.appendChild(li)
    })
    return ul_outer
  }
}
