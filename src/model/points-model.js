import { UpdateType } from '../const.js';
import Observable from '../framework/observable.js';

export default class PointsModel extends Observable {

  #pointsApiService = null;

  #points = [];
  #offers = [];
  #destinations = [];

  constructor ({pointsApiService}) {
    super();
    this.#pointsApiService = pointsApiService;

  }

  get points() {
    return this.#points;
  }

  get offers() {
    return this.#offers;
  }

  get destinations() {
    return this.#destinations;
  }

  async init () {
    try {
      const points = await this.#pointsApiService.points;
      const offers = await this.#pointsApiService.offers;
      const destinations = await this.#pointsApiService.destinations;
      this.#points = points.map(this.#adaptToClient);
      this.#offers = offers;
      this.#destinations = destinations;
    } catch (err) {
      this.#points = [];
      this.#offers = [];
      this.#destinations = [];
    }
    this._notify(UpdateType.INIT);
  }

  addPoint (updateType, update) {
    this.#points = [update, ...this.points];

    this._notify(updateType, update);
  }

  deletePoint (updateType, update) {
    const index = this.#points.findIndex((point) => point.id === update.id);

    if (index > -1) {
      this.#points.splice(index, 1);
    }

    this._notify(updateType);
  }

  updatePoint (updateType, update) {
    const index = this.#points.findIndex((point) => point.id === update.id);

    if(index > -1) {
      this.#points[index] = update;
    }

    this._notify(updateType, update);
  }

  #adaptToClient(point) {
    const adaptedPoint = {
      ...point,
      basePrice: point['base_price'],
      dateFrom: point['date_from'] !== null ? new Date(point['date_from']) : point['date_from'],
      dateTo: point['date_to'] !== null ? new Date(point['date_to']) : point['date_to'],
      isFavorite: point['is_favorite']
    };

    delete adaptedPoint['base_price'];
    delete adaptedPoint['date_from'];
    delete adaptedPoint['date_to'];
    delete adaptedPoint['is_favorite'];

    return adaptedPoint;
  }

  getDestinationById = (id) => {
    const foundDestination = this.#destinations.find((destination) => destination.id === id);
    return foundDestination;
  };

  getOfferById = (id) => {
    let offerItem;
    this.#offers.forEach((offer) => {
      offer.offers.forEach((item) => {
        if (item.id === id) {
          offerItem = item;
        }
      });
    });
    return offerItem;
  };

  getAllOffersByType = (type) => {
    let offersByType = [];
    this.#offers.forEach((offer) => {
      if (offer.type === type) {
        offersByType = offer.offers;
      }
    });
    return offersByType;
  };

}
