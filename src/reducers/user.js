import { SET_USER_LOGINH, SET_USER_TOKEN } from '../constants';
export default function user(state = {}, action) {
    switch (action.type) {
    case SET_USER_LOGINH:
        return {
            ...state,
            "Login": "https://i.ytimg.com/vi/C37uTdmcPuc/hqdefault.jpg?custom=true&w=168&h=94&stc=true&jpg444=true&jpgq=90&sp=68&sigh=qr82zRUv9xqFMJAgkrCR07N2P2Q",
        }
    case SET_USER_TOKEN:
        return {
            ...state,
            "Token": action.text,
        };
    default:
        return state;
    }
}