import {SET_VIDEO_ID} from '../constants';
export default function video(state = {}, action) {
  switch (action.type) {
    case SET_VIDEO_ID:
    return {
      ...state,
      "Id":action.text,
    }
    default:
      return {"Id":""};
  }
}
