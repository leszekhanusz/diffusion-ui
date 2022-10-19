import { defineStore } from "pinia";
import { useBackendStore } from "@/stores/backend";
import { getUserInfoStableHorde } from "@/actions/generate_stable_horde";

export const useStableHordeStore = defineStore({
  id: "stable_horde",
  state: () => ({
    anon_key: "0000000000",
    user_info: null,
  }),
  getters: {
    api_key_input: function () {
      const backend = useBackendStore();
      return backend.findInput("api_key", false);
    },
    api_key: function (state) {
      const api_key_input = state.api_key_input;
      if (api_key_input) {
        return api_key_input.value;
      }
      return state.anon_key;
    },
    needs_userinfo: function (state) {
      const backend = useBackendStore();

      const needed =
        backend.current.type === "stable_horde" && state.user_info === null;
      if (needed) {
        getUserInfoStableHorde();
      }
      return needed;
    },
    kudos: function (state) {
      if (state.user_info) {
        return parseInt(state.user_info.kudos, 10);
      }
    },
  },
  actions: {},
});
