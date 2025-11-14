import { IOrder } from "../../types";
import { EventEmitter } from "../base/events";
import { Model } from "../base/Model";

// Модель заказа
export class OrderModel extends Model<IOrder> implements IOrder {
    declare email: string;
    declare phone:  string;
    declare items: string[];

    constructor(data: IOrder, events: EventEmitter) {
        super(data, events);
    }
    
    // Получение данных, которые будут использованы при заказе
    get order(): IOrder {
        return {
            email: this.email,
            phone: this.phone,
            items: this.items
        }
    }
}