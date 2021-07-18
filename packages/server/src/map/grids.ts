/* global module */

import _ from 'lodash';
import Map from './map';
import Entity from '../game/entity/entity';

class Grids {
    map: Map;
    entityGrid: any;

    constructor(map: Map) {
        this.map = map;

        this.entityGrid = [];

        this.load();
    }

    load() {
        for (let i = 0; i < this.map.height; i++) {
            this.entityGrid[i] = [];

            for (let j = 0; j < this.map.width; j++) this.entityGrid[i][j] = {};
        }
    }

    updateEntityPosition(entity: Entity) {
        if (entity && entity.oldX === entity.x && entity.oldY === entity.y) return;

        this.removeFromEntityGrid(entity, entity.oldX, entity.oldY);
        this.addToEntityGrid(entity, entity.x, entity.y);

        entity.updatePosition();
    }

    addToEntityGrid(entity: Entity, x: number, y: number) {
        if (
            entity &&
            x > 0 &&
            y > 0 &&
            x < this.map.width &&
            x < this.map.height &&
            this.entityGrid[y][x]
        )
            this.entityGrid[y][x][entity.instance] = entity;
    }

    removeFromEntityGrid(entity: Entity, x: number, y: number) {
        if (
            entity &&
            x > 0 &&
            y > 0 &&
            x < this.map.width &&
            y < this.map.height &&
            this.entityGrid[y][x] &&
            entity.instance in this.entityGrid[y][x]
        )
            delete this.entityGrid[y][x][entity.instance];
    }

    getSurroundingEntities(entity: Entity, radius?: number, include?: boolean) {
        let entities = [];

        if (!this.checkBounds(entity.x, entity.y, radius)) return;

        for (let i = -radius; i < radius + 1; i++) {
            for (let j = -radius; j < radius + 1; j++) {
                let pos = this.entityGrid[entity.y + i][entity.x + j];

                if (_.size(pos) > 0) {
                    _.each(pos, (pEntity: Entity) => {
                        if (!include && pEntity.instance !== entity.instance)
                            entities.push(pEntity);
                    });
                }
            }
        }

        return entities;
    }

    getSurroundingValidDropCellCoords(startX: number, startY: number, radius?: number) {
        let dropCellCoords = [];

        for (let i = 0; i <= radius; i++) {
            for (let y = startY - i; y < startY + i + 1; y++) {
                if (y < 0) continue;  
                if (y >= this.map.height) break;
                for (let x = startX - i; x < startX + i + 1; x += Math.abs(y - startY) === i ? 1 : i * 2) {
                    if (x < 0) continue;
                    if (x >= this.map.width) break;

                    if (
                        !this.map.isEmpty(x, y) &&
                        !this.map.isColliding(x, y) &&
                        !this.map.isDoor(x, y)
                    ) {
                        let cell = this.entityGrid[y][x];
                        let canDropOnEntity = true;

                        if (_.size(cell) > 0) {
                            _.each(cell, (entity: Entity) => {
                                canDropOnEntity = !(entity.isPlayer() || entity.isItem());
                            });
                        }

                        if (canDropOnEntity) {
                            dropCellCoords.push({'x': x, 'y': y});
                        }
                    }
                }
            }
        }
        return dropCellCoords;
    }

    checkBounds(x: number, y: number, radius?: number) {
        return (
            x + radius < this.map.width &&
            x - radius > 0 &&
            y + radius < this.map.height &&
            y - radius > 0
        );
    }
}

export default Grids;
