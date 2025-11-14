import { LotModel } from "./LotModel";
import { Model } from "../base/Model";
import { EventEmitter } from "../base/events";
import { ILot, LotUpdate } from "../../types";

export class LotListModel extends Model<{lots: LotModel[]}> {
    declare private _lots: LotModel[];

    constructor(data: ILot[], events: EventEmitter) {
        const lotModels = data.map(lotData => new LotModel(lotData, events));
        super({lots: lotModels}, events);
    }

    get lots(): LotModel[] {
        return this._lots;
    }

    set lots(value: LotModel[]) {
        this._lots = value;
    }

    getLotById(id: string): LotModel | undefined {
        return this._lots.find(lot => lot.id === id);
    }

    updateLot(updateData: LotUpdate): void {
        const lot = this.getLotById(updateData.id);
        if (lot) {
            lot.updateFromAPI(updateData);
        }
    }
}