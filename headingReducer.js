
const initialState = {
    heading : {h1Text: "Travel. Food. Fashion.", h2Text: "Curating interesting tales for you.", metaTags : []},
};

export function headingReducer(state = initialState, action) {
    switch (action.type) {
        case 'UPDATE_HEADING':
            return Object.assign({}, state, {heading: action.heading});
            break;
        default:
            return state;
            break;
}
}
