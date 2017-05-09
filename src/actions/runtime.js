/* eslint-disable import/prefer-default-export */

import { SET_RUNTIME_VARIABLE, SET_TEMPLATE_ID } from '../constants';

export function setRuntimeVariable({name, value}) {
    return {
        type: SET_RUNTIME_VARIABLE,
        payload: {
            name,
            value,
        },
    };
}
export function setTemplateID(value) {
    return {
        type: SET_TEMPLATE_ID,
        text: value
    };
}