import { Model } from "../base/Model";
import { ILot, LotStatus, LotStatusDate, LotUpdate } from "../../types";
import { EventEmitter } from "../base/events";

export class LotModel extends Model<ILot> implements ILot {
    declare private _lot_info: ILot;

    declare private _id: string;
    declare private _title: string;
    declare private _description: string;
    declare private _datetime: string;
    declare private _status: LotStatus;
    declare private _about: string;
    declare private _image: string;
    declare private _minPrice: number;
    declare private _price: number;
    declare private _history: number[];

    constructor(data: ILot, events: EventEmitter) {
        super(data, events);
        this._lot_info = data;
    }

    get lot_info(): ILot {
        return this._lot_info
    }

    get id(): string {
        return this._id;
    }

    set id(value: string) {
        this._id = value;
    }

    get title(): string {
        return this._title;
    }

    set title(value: string) {
        this._title = value;
    }

    get description(): string {
        return this._description;
    }

    set description(value: string) {
        this._description = value;
    }

    get datetime(): string {
        return this._datetime;
    }

    set datetime(value: string) {
        if (value !== this._datetime) {
            this._datetime = value;
        }
    }

    get status(): LotStatus {
        return this._status;
    }

    set status(value: LotStatus) {
        if (value !== this._status) {
            this._status = value;
            this.emitChanges('lot:status:update', {
                id: this._id,
                status: value
            })
        };
    }

    get about(): string {
        return this._about;
    }

    set about(value: string) {
        this._about = value;
    }

    get image(): string {
        return this._image;
    }

    set image(value: string) {
        this._image = value;
    }

    get minPrice(): number {
        return this._minPrice;
    }

    set minPrice(value: number) {
        this._minPrice = value;
    }

    get price(): number {
        return this._price;
    }

    set price(value: number | undefined) {
        this._price = value;
    }

    get formattedPrice(): string {
        return `${this._price?.toLocaleString('ru-RU')} Р`;
    }

    get history(): number[] {
        return this._history;
    }

    set history(value: number[]) {
        if (value !== this._history) {
            this._history = value;
        }
    }

    get statusDateText(): LotStatusDate {
        let title: string;
        let subtitle: string;

        const now = new Date();
        const eventDate = new Date(this._datetime);
        const diff = eventDate.getTime() - now.getTime();


        const formatDate = this.formatDateTimeAuction(diff);

        if (this._status === 'active') {
            title = formatDate,
            subtitle = "До закрытия лота"
        } else if (this._status === 'wait'){
            title = formatDate,
            subtitle = "До открытия лота"
        }
        else {
            title = "Аукцион завершён",
            subtitle = `Продано за ${this.formattedPrice}`
        }

        return {
            title: title,
            subtitle: subtitle
        }
    }

    makeBid(value: number) {
        if (this.checkBid(value) || !value) {
            this.price = value;
            this.addPriceToHistory(value);
            
            this.emitChanges('lot:price:update', {
                id: this._id,
                price: value,
            })
        } else {
            throw("Ставка должна быть выше последней сделанной ставки!");
        }
    }

    checkBid(bid: number): boolean {
        console.log(
            `Проверка ставки: \n
            Price: ${this._price} \n
            Min price: ${this._minPrice} \n
            Your ptice: ${bid}`
        )
        if (bid - this._price >= this._minPrice) {
            return true;
        } else {
            return false;
        }
    }

    getDateTimeMain(): string {
        const date = new Date(this._datetime);

        if (this._status === 'active') {
            return `Открыто до ${this.formatDateTimeMain(date)}`;
        } else if (this._status === "wait") {
            return `Откроется ${this.formatDateTimeMain(date)}`;
        } else {
            return `Закрыто ${this.formatDateTimeMain(date)}`;
        }
    }

    private addPriceToHistory(price: number) {
        if (price) {
            this._history.push(price);
        }
    }

    private formatDateTimeMain(datetime: Date): string {
        return datetime.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    private formatDateTimeAuction(datetime: number): string {
        // Разлагаем миллисекунды на компоненты
        const seconds = Math.floor((datetime / 1000) % 60);
        const minutes = Math.floor((datetime / (1000 * 60)) % 60);
        const hours = Math.floor((datetime / (1000 * 60 * 60)) % 24);
        const days = Math.floor(datetime / (1000 * 60 * 60 * 24));

        // Форматируем с ведущими нулями где нужно
        const formattedDays = days > 0 ? `${days}д ` : '';
        const formattedHours = `${hours.toString().padStart(2, '0')}ч`;
        const formattedMinutes = `${minutes.toString().padStart(2, '0')}мин`;
        const formattedSeconds = `${seconds.toString().padStart(2, '0')}сек`;

        return `${formattedDays}${formattedHours} ${formattedMinutes} ${formattedSeconds}`;
    }

    updateFromAPI(updateData: LotUpdate): void {
        // Обновляем только пришедшие поля
        if (updateData.price !== undefined) {
            this.makeBid(updateData.price);
        }
        if (updateData.status !== undefined) {
            this._status = updateData.status;
        }
        if (updateData.datetime !== undefined) {
            this._datetime = updateData.datetime;
        }
        
        // Уведомляем об изменениях
        this.emitChanges('lot:updated', { lotId: this._id, data: updateData });
    }
}
