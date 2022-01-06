import { CommonJSONObject } from './menu'

export function getProperty (options: CommonJSONObject, opt: string, def: any): any {
  return isDefined(options[opt]) ? options[opt] : def
}

export function getSizes (obj: HTMLElement): { width: number, height: number } {
  const liArr = Array.from(obj.getElementsByTagName('li'))

  let widthDef = 0
  let heightDef = 0
  for (const li of liArr) {
    widthDef = Math.max(li.offsetWidth, widthDef)
    heightDef = Math.max(li.offsetHeight, heightDef)
  }

  let width = widthDef
  let height = heightDef
  for (const li of liArr) {
    const ul = li.getElementsByTagName('ul')
    const firstUl = ul[0]
    if (isDefined(firstUl)) {
      const ulSize = getSizes(firstUl)
      width = Math.max(widthDef + ulSize.width, width)
      height = Math.max(heightDef + ulSize.height, height)
    }
  }

  return { width, height }
}

export function isUndefined (obj: any): boolean {
  return typeof obj === 'undefined'
}

export function isDefined (obj: any): boolean {
  return !isUndefined(obj)
}

export function isObject (obj: any): boolean {
  return obj !== null && typeof obj === 'object'
}
