
const initialState = {
    show_loader : false
};

export function loaderReducer(state = initialState, action) {
    switch (action.type) {
        case 'SHOW_LOADER':
            return Object.assign({}, state, {show_loader: action.show_loader});
            break;
        default:
            return state;
            break;
}
}
