import { defineStore } from "pinia";
import { useBackendStore } from "@/stores/backend";

const anon_key = "0000000000";

export const useStableHordeStore = defineStore({
  id: "stable_horde",
  state: () => ({
    user_info: null,
    anon_key: anon_key,
  }),
  getters: {
    api_key_input: function () {
      const backend = useBackendStore();
      return backend.findInput("api_key", false);
    },
    anonymous: (state) => state.api_key === anon_key,
    api_key: function (state) {
      const api_key_input = state.api_key_input;
      if (api_key_input) {
        return api_key_input.value;
      }
      return "";
    },
    valid_api_key: (state) => !!state.user_info,
    kudos: function (state) {
      if (state.user_info) {
        return parseInt(state.user_info.kudos, 10);
      }
    },
    username: function (state) {
      if (state.user_info) {
        const username_with_hash = state.user_info.username;
        return username_with_hash.split("#")[0];
      } else {
        return "";
      }
    },
  },
  actions: {},
});
