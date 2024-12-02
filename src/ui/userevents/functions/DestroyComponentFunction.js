/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import EditorEventBus from "../../components/editor/EditorEventBus";
import {COMPONENT_DESTROYED} from '../../components/editor/items/shapes/Component.vue';
import { traverseItems } from "../../scheme/Item";

export default {
    name: 'Destroy component',

    description: 'Removes all the loaded items of the component. Applicable to "component" shapes only',
    args: { },

    supportedShapes: ['component'],

    execute(item, args, schemeContainer, userEventBus, resultCallback) {
        try {
            // Cleaning up the overlay layer with the custom component background
            // and the "go back" button
            traverseItems(item._childItems, subItem => {
                userEventBus.clearEventsForItem(subItem.id);
            });
            item._childItems = [];
            userEventBus.emitItemEvent(item.id, COMPONENT_DESTROYED);
            EditorEventBus.item.changed.specific.$emit(schemeContainer.editorId, item.id);
        }
        catch(err) {
            console.error(err);
        }
        resultCallback();
    }
};


