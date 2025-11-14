import './scss/styles.scss';

import {AuctionAPI} from "./components/AuctionAPI";
import {API_URL, CDN_URL} from "./utils/constants";
import {EventEmitter} from "./components/base/events";

import { LotModel } from './components/models/LotModel';
import { LotListModel } from './components/models/LotListModel';
import { BidModel } from './components/models/BidModel';
import { IOrder } from './types';
import { OrderModel } from './components/models/OrderModel';

const events = new EventEmitter();
const api = new AuctionAPI(CDN_URL, API_URL);

// Чтобы мониторить все события, для отладки
events.onAll(({ eventName, data }) => {
    console.log(eventName, data);
})

// Все шаблоны


// Модель данных приложения

// Глобальные контейнеры


// Переиспользуемые части интерфейса


// Дальше идет бизнес-логика
// Поймали событие, сделали что нужно


async function initializeApp() {
    console.log("Сиписок лотов: ")

    let lotListModel: LotListModel | undefined;

    // Получаем лоты с сервера
    await api.getLotList()
        .then(result => {
            // вместо лога поместите данные в модель
            lotListModel = new LotListModel(result, events);
        })
        .catch(err => {
            console.error(err);
        });


    const lotList: LotModel[] | undefined = lotListModel?.lots;
    lotList?.forEach(lot => {
        console.log(
            `
            Id: ${lot.id}\n
            Title: ${lot.title}\n
            About: ${lot.about}\n
            Image: ${lot.image}\n
            Date: ${lot.getDateTimeMain()}\n
            Price: ${lot.price}\n
            \n`
        )
    })

    let lot: LotModel | undefined;

    console.log('Открываем лот 2:');

    await api.getLotItem(lotList[1].id)
        .then(result => {
            lot = new LotModel(result, events);
        })
        .catch(err => {
            console.error(err);
        })

    if (lot) {
        console.log(
            `Image: ${lot?.image}\n
            Status title: ${lot?.statusDateText.title}\n
            Status subtitle: ${lot?.statusDateText.subtitle}\n
            ${lot.status === 'active' 
                ?
                    `Last bids: ${lot.history}` 
                :
                    ''
            }
            Title: ${lot?.title}\n
            Description: ${lot?.description}\n`
        );

        const price = 1000;

        const bid: BidModel = new BidModel({
            price: price
        }, events);

        console.log(`Сделаем ставку ${bid} Р:`)



        await api.placeBid(lot.id, bid)
            .then(result => {
                try {
                    lot.updateFromAPI(result);

                    console.log(lot.history);

                    console.log(
                        `Сделана ставка ${bid.price} Р\n
                        Новая история ставок: ${lot.history}`
                    )

                    console.log("Данные успешно обновлены!")
                } catch (err) {
                    console.error(err)
                }         
            })


        console.log("Сделаем заказ 3 лота")

        const order_lot_id = "b06cde61-912f-4663-9751-09956c0eed67";
        
        const order_data: IOrder = {
            email: "maxsimtorub@gmail.com",
            phone: "+79193231232",
            items: [
                order_lot_id
            ]
        }

        const order: OrderModel = new OrderModel(order_data, events);
        
        await api.orderLots(order)
            .then(result => {
                console.log(result);
                console.log("Успешно!");
            })
            .catch(err => {
                console.error(err);
            })
    }
}

initializeApp();
