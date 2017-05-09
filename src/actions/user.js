/* eslint-disable import/prefer-default-export */

import { SET_USER_LOGINH, SET_USER_TOKEN } from '../constants';

export function setUserLogin(staue) {
    return {
        type: SET_USER_LOGINH,
        text: staue,
    };
}
export function setUserToken(dispatch, token) {
    return dispatch({
        type: SET_USER_TOKEN,
        text: token
    })
}