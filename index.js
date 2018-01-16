import { combineReducers } from 'redux';
import {hasErrored, similarLinksData} from './similarLinks';
import { tagReducer} from './tagReducer';
import { listingReducer} from './listingReducer';
import { headingReducer} from './headingReducer';
import { loaderReducer} from './loaderReducer';
import { guideReducer} from './guideReducer';

export default combineReducers({
    hasErrored, 
    similarLinksData,
    tagReducer, 
    guideReducer,
    listingReducer,
    headingReducer,
    loaderReducer
});
