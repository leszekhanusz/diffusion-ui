import { defineStore } from "pinia";

export const useOutputStore = defineStore({
  id: "output",
  state: () => ({
    loading: false,
    loading_progress: null,
    loading_message: null,
    request_uuid: null,
    images: {
      content: [],
      metadata: null,
      original_image: null,
      history: null,
    },
    gallery: [],
    error_message: null,
  }),
  getters: {
    gallery_images: function (state) {
      return state.images.content.map(function (image, idx) {
        return {
          itemImageSrc: image,
          thumbnailImageSrc: image,
          index: idx,
        };
      });
    },
  },
  actions: {},
});
