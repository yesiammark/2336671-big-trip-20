import TripEventsItemView from '../view/trip-events_item.js';
import EditPointView from '../view/edit-point-view.js';
import { remove, render, replace } from '../framework/render';
import { UserAction, UpdateType } from '../const.js';


const Mode = {
  DEFAULT: 'DEFAULT',
  EDITING: 'EDITING'
};
export default class EventPresenter {
  #eventsListContainer = null;
  #handleDataChange = null;
  #handleModeChange = null;

  #pointsModel = null;
  #point = null;

  #eventComponent = null;
  #eventEditComponent = null;

  #mode = Mode.DEFAULT;

  constructor ({pointsModel, eventsListContainer, onDataChange, onModeChange}) {
    this.#pointsModel = pointsModel;
    this.#eventsListContainer = eventsListContainer;
    this.#handleDataChange = onDataChange;
    this.#handleModeChange = onModeChange;
  }

  init (point) {
    this.#point = point;

    const prevEventComponent = this.#eventComponent;
    const prevEventEditComponent = this.#eventEditComponent;

    this.#eventComponent = new TripEventsItemView({
      pointsModel: this.#pointsModel,
      point: this.#point,
      onEditClick: this.#handleEditClick,
      onFavoriteClick: this.#handleFavoriteClick
    });

    this.#eventEditComponent = new EditPointView({
      pointsModel: this.#pointsModel,
      point: this.#point,
      onFormSubmitClick: this.#handleSubmitClick,
      onFormCancelClick: this.#handleCancelClick,
      onFormDeleteClick: this.#handleDeleteClick
    });

    if (prevEventComponent === null || prevEventEditComponent === null) {
      render(this.#eventComponent, this.#eventsListContainer);
      return;
    }

    if (this.#mode === Mode.DEFAULT) {
      replace(this.#eventComponent, prevEventComponent);
    }

    if (this.#mode === Mode.EDITING) {
      replace(this.#eventEditComponent, prevEventEditComponent);
    }

    remove(prevEventComponent);
    remove(prevEventEditComponent);
  }

  resetView () {
    if (this.#mode !== Mode.DEFAULT) {
      this.#eventEditComponent.reset(this.#point);
      this.#replaceEditToItem();
    }
  }

  destroy() {
    remove(this.#eventComponent);
    remove(this.#eventEditComponent);
  }

  setSaving () {
    if (this.#mode === Mode.EDITING) {
      this.#eventEditComponent.updateElement({
        isDisabled: true,
        isSaving: true,
      });
    }
  }

  setDeleting () {
    if (this.#mode === Mode.EDITING) {
      this.#eventEditComponent.updateElement({
        isDisabled: true,
        isDeleting: true,
      });
    }
  }

  #escKeyDownHandler = (evt) => {
    if (evt.key === 'Escape') {
      evt.preventDefault();
      this.#eventEditComponent.reset(this.#point);
      this.#replaceEditToItem();
    }
  };

  #replaceItemToEdit() {
    replace(this.#eventEditComponent, this.#eventComponent);
    document.addEventListener('keydown', this.#escKeyDownHandler);
    this.#handleModeChange();
    this.#mode = Mode.EDITING;
  }

  #replaceEditToItem() {
    replace(this.#eventComponent, this.#eventEditComponent);
    document.removeEventListener('keydown', this.#escKeyDownHandler);
    this.#mode = Mode.DEFAULT;
  }

  #handleEditClick = () => {
    this.#replaceItemToEdit();
  };

  #handleFavoriteClick = () => {
    this.#handleDataChange(
      UserAction.UPDATE_POINT,
      UpdateType.PATCH,
      {...this.#point, isFavorite: !this.#point.isFavorite }
    );
  };

  #handleSubmitClick = (task) => {
    this.#handleDataChange(
      UserAction.UPDATE_POINT,
      UpdateType.MINOR,
      task
    );
  };

  #handleCancelClick = () => {
    this.#eventEditComponent.reset(this.#point);
    this.#replaceEditToItem();
  };

  #handleDeleteClick = (task) => {
    this.#handleDataChange(
      UserAction.DELETE_POINT,
      UpdateType.MINOR,
      task
    );
  };
}
