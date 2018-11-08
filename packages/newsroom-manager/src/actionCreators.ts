import { AnyAction } from "redux";
import { findIndex } from "lodash";
import { EthAddress, Civil, CharterData, RosterMember } from "@joincivil/core";
import { StateWithNewsroom } from "./reducers";
import { CmsUserData } from "./types";
import { makeUserObject } from "./utils";

export enum newsroomActions {
  UPDATE_NEWSROOM = "UPDATE_NEWSROOM",
  CHANGE_NAME = "CHANGE_NAME",
  ADD_EDITOR = "ADD_EDITOR",
  REMOVE_EDITOR = "REMOVE_EDITOR",
  SET_IS_OWNER = "SET_IS_OWNER",
  SET_IS_EDITOR = "SET_IS_EDITOR",
}

export enum uiActions {
  ADD_GET_CMS_USER_DATA_FOR_ADDRESS = "ADD_GET_CMS_USER_DATA_FOR_ADDRESS",
  GET_CMS_USER_DATA_FOR_ADDRESS = "GET_CMS_USER_DATA_FOR_ADDRESS",
  ADD_PERSIST_CHARTER = "ADD_PERSIST_CHARTER",
  PERSIST_CHARTER = "PERSIST_CHARTER",
}

export enum userActions {
  ADD_USER = "ADD_USER",
}

export enum governmentActions {
  ADD_CONSTITUTION_URI = "ADD_CONSTITUTION_URI",
  ADD_CONSTITUTION_HASH = "ADD_CONSTITUTION_HASH",
}

export const getEditors = (address: EthAddress, civil: Civil): any => async (
  dispatch: any,
  getState: any,
): Promise<void> => {
  const state = getState();
  const newsroom = await civil.newsroomAtUntrusted(address);
  await newsroom.editors().forEach(async val => {
    const getCmsUserDataForAddress = state.newsroomUi.get(uiActions.GET_CMS_USER_DATA_FOR_ADDRESS);
    if (getCmsUserDataForAddress && !state.newsroomUsers.get(val)) {
      const userData = await getCmsUserDataForAddress(val);
      dispatch(addUser(address, val, userData));
    }
    dispatch(addEditor(address, val));
  });
};

export const getNewsroom = (address: EthAddress, civil: Civil): any => async (
  dispatch: any,
  getState: any,
): Promise<AnyAction> => {
  const newsroom = await civil.newsroomAtUntrusted(address);
  const wrapper = await newsroom.getNewsroomWrapper();
  const state = getState();
  const getCmsUserDataForAddress = state.newsroomUi.get(uiActions.GET_CMS_USER_DATA_FOR_ADDRESS);
  if (getCmsUserDataForAddress) {
    wrapper.data.owners.forEach(async (userAddress: EthAddress): Promise<void> => {
      if (!state.newsroomUsers.get(userAddress)) {
        const userData = await getCmsUserDataForAddress(userAddress);
        dispatch(addUser(address, userAddress, userData));
      }
    });
  }
  return dispatch(updateNewsroom(address, { wrapper, newsroom }));
};

export const getIsOwner = (address: EthAddress, civil: Civil): any => async (
  dispatch: any,
  getState: any,
): Promise<AnyAction> => {
  const newsroom = await civil.newsroomAtUntrusted(address);
  return dispatch(setIsOwner(address, await newsroom.isOwner()));
};

export const getIsEditor = (address: EthAddress, civil: Civil): any => async (
  dispatch: any,
  getState: any,
): Promise<AnyAction> => {
  const newsroom = await civil.newsroomAtUntrusted(address);
  return dispatch(setIsEditor(address, await newsroom.isEditor()));
};

export const updateNewsroom = (address: EthAddress, data: any): AnyAction => {
  return {
    type: newsroomActions.UPDATE_NEWSROOM,
    data: {
      address,
      ...data,
    },
  };
};

export const addEditor = (address: EthAddress, editor: EthAddress): AnyAction => {
  return {
    type: newsroomActions.ADD_EDITOR,
    data: {
      address,
      editor,
    },
  };
};

export const removeEditor = (address: EthAddress, editor: EthAddress) => {
  return {
    type: newsroomActions.REMOVE_EDITOR,
    data: {
      address,
      editor,
    },
  };
};

export const setIsOwner = (address: EthAddress, isOwner: boolean) => {
  return {
    type: newsroomActions.SET_IS_OWNER,
    data: {
      address,
      isOwner,
    },
  };
};

export const setIsEditor = (address: EthAddress, isEditor: boolean) => {
  return {
    type: newsroomActions.SET_IS_EDITOR,
    data: {
      address,
      isEditor,
    },
  };
};

export const changeName = (address: EthAddress, name: string): AnyAction => {
  return {
    type: newsroomActions.CHANGE_NAME,
    data: { name, address },
  };
};

export const updateCharter = (address: EthAddress, charter: Partial<CharterData>): any => (
  dispatch: any,
  getState: any,
): AnyAction => {
  const { newsrooms, newsroomUi }: StateWithNewsroom = getState();
  const newsroom = newsrooms.get(address) || { wrapper: { data: {} } };
  const persistCharter = newsroomUi.get(uiActions.PERSIST_CHARTER);
  if (persistCharter) {
    persistCharter(charter);
  }
  return dispatch(
    updateNewsroom(address, {
      ...newsroom,
      charter,
    }),
  );
};

export const fetchNewsroom = (address: EthAddress): any => async (dispatch: any, getState: any): Promise<AnyAction> => {
  const { newsrooms }: StateWithNewsroom = getState();
  const newsroom = newsrooms.get(address);
  const wrapper = await newsroom.newsroom!.getNewsroomWrapper();
  return dispatch(updateNewsroom(address, { ...newsroom, wrapper }));
};

export const addGetCmsUserDataForAddress = (func: (address: EthAddress) => Promise<CmsUserData>): AnyAction => {
  return {
    type: uiActions.ADD_GET_CMS_USER_DATA_FOR_ADDRESS,
    data: func,
  };
};

export const addPersistCharter = (func: (charter: Partial<CharterData>) => void): AnyAction => {
  return {
    type: uiActions.ADD_PERSIST_CHARTER,
    data: func,
  };
};

export const addUser = (newsroomAddress: EthAddress, address: EthAddress, userData: CmsUserData): any => (
  dispatch: any,
  getState: any,
): AnyAction => {
  const { newsrooms }: StateWithNewsroom = getState();
  const charter = (newsrooms.get(newsroomAddress) || {}).charter || {};
  let roster = charter.roster || [];
  if (findIndex(roster, member => member.ethAddress === address) === -1) {
    roster = roster.concat(makeUserObject(address, userData).rosterData as RosterMember);
    dispatch(
      updateCharter(newsroomAddress, {
        ...charter,
        roster,
      }),
    );
  }

  return dispatch({
    type: userActions.ADD_USER,
    data: {
      address,
      userData,
    },
  });
};

export const addConstitutionUri = (uri: string): AnyAction => {
  return {
    type: governmentActions.ADD_CONSTITUTION_URI,
    data: {
      uri,
    },
  };
};

export const addConstitutionHash = (hash: string): AnyAction => {
  return {
    type: governmentActions.ADD_CONSTITUTION_HASH,
    data: {
      hash,
    },
  };
};
