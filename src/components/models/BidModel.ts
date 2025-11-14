import { IBid } from "../../types";
import { EventEmitter } from "../base/events";
import { Model } from "../base/Model";

export class BidModel extends Model<IBid> implements IBid {
    declare private _price: number;

    constructor(data: IBid, events: EventEmitter) {
        super(data, events);
    }

    get price(): number {
        return this._price;
    }

    set price(value: number) {
        this._price = value;
    }
}