import { LotModel } from "./LotModel";
import { Model } from "../base/Model";
import { EventEmitter } from "../base/events";
import { ILot, LotUpdate } from "../../types";

// Модель списка лотов
export class LotListModel extends Model<{lots: LotModel[]}> {
    declare lots: LotModel[];

    constructor(data: ILot[], events: EventEmitter) {
        const lotModels = data.map(lotData => new LotModel(lotData, events));
        super({lots: lotModels}, events);
    }


    getLotById(id: string): LotModel | undefined {
        return this.lots.find(lot => lot.id === id);
    }

    updateLot(updateData: LotUpdate): void {
        const lot = this.getLotById(updateData.id);
        if (lot) {
            lot.updateFromAPI(updateData);
        }
    }
}