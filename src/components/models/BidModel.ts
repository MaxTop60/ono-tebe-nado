import { IBid } from "../../types";
import { EventEmitter } from "../base/events";
import { Model } from "../base/Model";

export class BidModel extends Model<IBid> implements IBid {
    declare price: number;

    constructor(data: IBid, events: EventEmitter) {
        super(data, events);
    }

}