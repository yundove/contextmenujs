import {CommonJSONObject} from "./menu";

export function getProperty(options: CommonJSONObject, opt: string, def: unknown){
    return isDefined(options[opt]) ? options[opt]: def
}

export function getSizes(obj: HTMLElement){
    const li_arr = Array.from(obj.getElementsByTagName('li'));

    let width_def = 0, height_def = 0;
    for(let li of li_arr){
        width_def = Math.max(li.offsetWidth , width_def);
        height_def = Math.max(li.offsetHeight , height_def);
    }

    let width = width_def, height = height_def;
    for(let li of li_arr){
        const ul = li.getElementsByTagName('ul');
        const first_ul = ul[0]
        if(isDefined(first_ul)){
            const ul_size = getSizes(first_ul);
            width = Math.max(width_def + ul_size.width, width)
            height = Math.max(height_def + ul_size.height, height)
        }
    }

    return { width, height };
}

export function isUndefined(obj: unknown){
    return typeof obj === "undefined"
}

export function isDefined(obj: unknown){
    return !isUndefined(obj)
}

export function isObject(obj: unknown){
    return  obj !== null  && typeof obj === "object"
}