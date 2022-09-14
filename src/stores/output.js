import { defineStore } from "pinia";

export const useOutputStore = defineStore({
  id: "output",
  state: () => ({
    loading: false,
    images: {
      content: [],
      metadata: null,
      original_image: null,
      canvas_history: null,
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
