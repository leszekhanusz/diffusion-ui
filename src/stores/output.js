import { defineStore } from "pinia";

export const useOutputStore = defineStore({
  id: "output",
  state: () => ({
    loading: false,
    images: [],
    error_message: null,
  }),
  getters: {
    gallery_images: (state) =>
      state.images.map((image, idx) => ({
        itemImageSrc: image,
        thumbnailImageSrc: image,
        index: idx,
      })),
  },
  actions: {},
});
