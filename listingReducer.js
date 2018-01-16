
const initialState = {
    carlist : null
};

export function listingReducer(state = initialState, action) {
    switch (action.type) {
        case 'UPDATE_LISTING':
            return Object.assign({}, state, {carlist: action.carlist, 'scrollToTop' : true});
            break;
        case 'LOAD_MORE_CARS':
            return Object.assign({}, state, {carlist: state.carlist.concat(action.carlist), 'scrollToTop' : false});
            break;
        default:
            return state;
            break;
}
}
