import './style.css'
import ContextMenu from "../lib";
import {ContextMenuItemType} from "../lib/constants";

var menu: ContextMenu;

var cmen = [
    {
        "text": "Item 1",
        "sub": [
            {
                "text": "Item 11"
            },
            {
                "text": "Item 12"
            },
            {
                "type": ContextMenuItemType.MENU_DIVIDER
            },
            {
                "text": "Item 13",
                "enabled": false,
                "sub": [
                    {
                        "text": "Item 131"
                    }
                ]
            }
        ]
    },
    {
        "text": "Item 2",
        "icon": '<i class="fas fa-exclamation-circle"></i>',
        "events": {
            "click": function(e: any){
                alert(e);
            }
        }
    }
];

window.addEventListener("load", function(){
    // @ts-ignore
    menu = new ContextMenu(cmen);

    // @ts-ignore
    document.getElementById('cmenu').addEventListener("contextmenu", function(e){
        menu.display(e);
    });
});
