import { ensureElement } from "../../utils/utils";
import { Component } from "../base/Component";

interface ICard {
    title: string;
    about: string;
    image: string;
    status: string
}

export class CardView extends Component<ICard> {
    protected _title: HTMLHeadElement;
    protected _about: HTMLParagraphElement;
    protected _image: HTMLImageElement;
    protected _status: HTMLSpanElement;


    constructor(blockName:string, container: HTMLElement) {
        super(container);
        this._title = ensureElement<HTMLHeadElement>(`.${blockName}__title`, container);
        this._about = ensureElement<HTMLParagraphElement>(`.${blockName}__description`, container);
        this._image = ensureElement<HTMLImageElement>(`.${blockName}__image`, container);
        this._status = ensureElement<HTMLSpanElement>(`.${blockName}__status`, container);
    }

    set title(value: string) {
        this.setText(this._title, value);
    }

    get title(): string {
        return this._title.textContent;
    }

    set about(value: string) {
        this.setText(this._about, value);
    }

    get about():string {
        return this._about.textContent;
    }

    set image(value: string) {
        this.setImage(this._image, value, this.title);
    }

    get image():string {
        return this._image.src;
    }

    set status(value: string) {
        this.setText(this._status, value);
    }
}