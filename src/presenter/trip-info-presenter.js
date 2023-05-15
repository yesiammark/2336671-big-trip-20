import { render, RenderPosition } from '../framework/render.js';
import TripInfoView from '../View/trip-info-view.js';

export default class TripInfoPresenter {

  #eventContainer = null;
  #pointsModel = null;

  constructor({eventContainer, pointsModel}) {
    this.#eventContainer = eventContainer;
    this.#pointsModel = pointsModel;
  }

  init () {
    this.eventPoints = [...this.#pointsModel.points];

    render(new TripInfoView({points: this.eventPoints}), this.#eventContainer, RenderPosition.AFTERBEGIN);
  }
}
