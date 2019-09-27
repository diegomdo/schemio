import Vue from 'vue';
import NoneShape from './NoneShape.vue';
import Rect from './Rect.vue';
import Ellipse from './Ellipse.vue';
import CommentShape from './CommentShape.vue';
import FramePlayer from './FramePlayer.vue';
import UMLObject from './uml/UMLObject.vue';
import UMLModule from './uml/UMLModule.vue';
import UMLPackage from './uml/UMLPackage.vue';
import UMLNode from './uml/UMLNode.vue';


/**
 * Used as a fallback in case a particular shape has not speicified identifyTextEditArea function
 * This is needed for handling in-svg text edit on double click
 * @param {SchemeItem} item 
 */
function identifyTextEditAreaFallback(item) {
    return {
        property: 'text',
        style: {}
    };
}

function defaultGetEventsFunc(item) {
    return [];
}

function _shape(shapeComponent) {
    return {
        args: shapeComponent.args,
        computePath: shapeComponent.computePath,
        // This function is used when SvgEditor tries to figure out which exact property has user double clicked on
        identifyTextEditArea: shapeComponent.identifyTextEditArea || identifyTextEditAreaFallback,
        getEvents: shapeComponent.getEvents || defaultGetEventsFunc,
        component: shapeComponent
    };
}

const shapeReigstry = {
    none: _shape(NoneShape),
    rect: _shape(Rect),
    ellipse: _shape(Ellipse),
    comment: _shape(CommentShape),
    frame_player: _shape(FramePlayer),
    uml_object: _shape(UMLObject),
    uml_module: _shape(UMLModule),
    uml_package: _shape(UMLPackage),
    uml_node: _shape(UMLNode),
};

/**
 * Generates a component and returns it's name
 * @param {string} encodedShape - an encoded JSON that represents a shape or a name of a in-buit shape: e.g. 'rect', 'ellipse'
 */
function make(encodedShape) {
    if (shapeReigstry[encodedShape]) {
        const shape = shapeReigstry[encodedShape];

        if (!shape.component && !shape.vueComponentName) {
            const componentName = `${encodedShape}-shape-svg-component`;
            Vue.component(componentName, {
                props: ['item'],
                template: shape.template
            })
            shape.vueComponentName = componentName;
        }
        return shape;
    } else {
        throw new Error('Custom shapes are not yet supported');
    }
}

export default {
    make,
    shapeReigstry,
    find(id) {
        return shapeReigstry[id];
    }
};
