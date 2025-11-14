import { Model } from "../base/Model";
import { ILot, LotStatus, LotStatusDate, LotUpdate } from "../../types";
import { EventEmitter } from "../base/events";


// Модель лота
export class LotModel extends Model<ILot> implements ILot {
    declare private _lot_info: ILot;

    declare id: string;
    declare title: string;
    declare description: string;
    declare datetime: string;
    declare status: LotStatus;
    declare about: string;
    declare image: string;
    declare minPrice: number;
    declare price: number;
    declare history: number[];

    constructor(data: ILot, events: EventEmitter) {
        super(data, events);
        this._lot_info = data;
    }

    // Полная информация о лоте
    get lot_info(): ILot {
        return this._lot_info
    }

    // Обновить статус
    private updateStatus(value: LotStatus) {
        if (value !== this.status) {
            this.status = value;
            this.emitChanges('lot:status:update', {
                id: this.id,
                status: value
            })
        };
    }
    
    // Форматировать стоимость
    get formattedPrice(): string {
        return `${this.price?.toLocaleString('ru-RU')} Р`;
    }

    // Вывести статус и дату в формате просмотра аукциона
    get statusDateText(): LotStatusDate {
        let title: string;
        let subtitle: string;

        const now = new Date();
        const eventDate = new Date(this.datetime);
        const diff = eventDate.getTime() - now.getTime();


        const formatDate = this.formatDateTimeAuction(diff);

        if (this.status === 'active') {
            title = formatDate,
            subtitle = "До закрытия лота"
        } else if (this.status === 'wait'){
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

    // Сделать ставку
    makeBid(value: number) {
        if (this.checkBid(value) || !value) {
            this.price = value;
            this.addPriceToHistory(value);
            
            this.emitChanges('lot:price:update', {
                id: this.id,
                price: value,
            })
        } else {
            throw("Ставка должна быть выше последней сделанной ставки!");
        }
    }

    // Проверка на возможность сделать ставку
    checkBid(bid: number): boolean {
        console.log(
            `Проверка ставки: \n
            Price: ${this.price} \n
            Min price: ${this.minPrice} \n
            Your ptice: ${bid}`
        )
        if (bid - this.price >= this.minPrice) {
            return true;
        } else {
            return false;
        }
    }

    // Получить отформатированный статус и дату для главной страницы (список лотов)
    getDateTimeMain(): string {
        const date = new Date(this.datetime);

        if (this.status === 'active') {
            return `Открыто до ${this.formatDateTimeMain(date)}`;
        } else if (this.status === "wait") {
            return `Откроется ${this.formatDateTimeMain(date)}`;
        } else {
            return `Закрыто ${this.formatDateTimeMain(date)}`;
        }
    }


    // Добавить новую ставку в историю ставок
    private addPriceToHistory(price: number) {
        if (price) {
            this.history.push(price);
        }
    }

    // Отформатировать дату для лота на главной странице
    private formatDateTimeMain(datetime: Date): string {
        return datetime.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    // Отформатировать дату для модального окна с аукционом
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
    
    // Обновить поля
    updateFromAPI(updateData: LotUpdate): void {
        // Обновляем только пришедшие поля
        if (updateData.price !== undefined) {
            this.makeBid(updateData.price);
        }
        if (updateData.status !== undefined) {
            this.updateStatus(updateData.status);
        }
        if (updateData.datetime !== undefined) {
            this.datetime = updateData.datetime;
        }
        
        // Уведомляем об изменениях
        this.emitChanges('lot:updated', { lotId: this.id, data: updateData });
    }
}
