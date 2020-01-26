import SchemeContainer from '../../src/ui/scheme/SchemeContainer';
import expect from 'expect';


const EventBusStub = {
    emitConnectorDeselected() {},
    emitItemSelected() {},
    emitItemDeselected() {}
};

const schemeThreeLevel = {
    items: [{
        id: 'qwe',
        name: 'Parent item',
        shape: 'rect',
        area: {x: 10, y: 0, w: 100, h: 50},
        childItems: [{
            id: 'asd',
            name: 'Child item',
            shape: 'comment',
            area: {x: 20, y: 0, w: 10, h: 5},
            childItems: [{
                area: {x: 60, y: 0, w: 60, h: 25},
                id: 'zxc',
                name: 'child sub-item',
                shape: 'ellipse'
            }]
        }, {
            area: {x: 20, y: 20, w: 10, h: 10},
            id: 'ert',
            name: 'Child item 2',
            shape: 'ellipse'
        }]
    }]
};

describe('SchemeContainer', () => {
    it('should calculate world point on item', () => {
        const schemeContainer = new SchemeContainer({items: []}, EventBusStub);

        const point = schemeContainer.worldPointOnItem(30, 20, {
            area: {x: 100, y: 200, r: 45, w: 100, h: 100}
        });

        expect(Math.floor(point.x)).toBe(107);
        expect(Math.floor(point.y)).toBe(235);
    });


    it('should calculate world point on sub item', () => {
        const schemeContainer = new SchemeContainer({items: [{
            id: 'qwe',
            area: {x: 100, y: 20, w: 100, h: 100, r: 90},
            childItems: [{
                id: 'asd',
                area: {x: 10, y: 30, w: 10, h: 10, r: 90}
            }]
        }]}, EventBusStub);

        const point = schemeContainer.worldPointOnItem(30, 20, schemeContainer.findItemById('asd'));

        expect(Math.round(point.x)).toBe(40);
        expect(Math.round(point.y)).toBe(10);
    });


    it('should calculate local point on sub item from given world point', () => {
        const schemeContainer = new SchemeContainer({items: [{
            id: 'qwe',
            area: {x: 100, y: 20, w: 100, h: 100, r: 90},
            childItems: [{
                id: 'asd',
                area: {x: 10, y: 30, w: 10, h: 10, r: 90}
            }]
        }]}, EventBusStub);

        const point = schemeContainer.localPointOnItem(40, 10, schemeContainer.findItemById('asd'));
        console.log('Local p', point);

        expect(Math.round(point.x)).toBe(30);
        expect(Math.round(point.y)).toBe(20);
    });

    it('should reindex all items including child items', () => {
        const schemeContainer = new SchemeContainer(schemeThreeLevel, EventBusStub);

        expect(schemeContainer.findItemById('qwe').name).toStrictEqual('Parent item');
        expect(schemeContainer.findItemById('asd').name).toStrictEqual('Child item');
        expect(schemeContainer.findItemById('zxc').name).toStrictEqual('child sub-item');
        expect(schemeContainer.findItemById('ert').name).toStrictEqual('Child item 2');
        
        expect(schemeContainer.getItems()).toHaveLength(4);
    });

    it('It should calculate boundary box properly including the child elements and their world coord.', () => {
        const schemeContainer = new SchemeContainer(schemeThreeLevel, EventBusStub);
        
        expect(schemeContainer.getBoundingBoxOfItems(schemeContainer.getItems())).toStrictEqual({
            x: 10, y: 0, w: 140, h: 50
        });
    });
});