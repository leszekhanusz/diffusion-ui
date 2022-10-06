import { defineStore } from "pinia";

export const useOutputStore = defineStore({
  id: "output",
  state: () => ({
    loading: false,
    loading_progress: null,
    loading_message: null,
    request_uuid: null,
    /*
    images: {
      content: [],
      metadata: null,
      original_image: null,
      history: null,
    },
    */
    image_index: {
      current: 0,
      saved: 0,
    },
    gallery: [],
    gallery_index: 0,
    error_message: null,
  }),
  getters: {
    nb_images: (state) => state.images.content.length,
    nb_gallery: (state) => state.gallery.length,
    images: (state) => state.gallery[state.gallery_index],
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
  actions: {
    goLeft() {
      if (this.image_index.current > 0) {
        this.image_index.current--;
        this.image_index.saved = this.image_index.current;
      }
    },
    goRight() {
      if (this.image_index.current < this.nb_images - 1) {
        this.image_index.current++;
        this.image_index.saved = this.image_index.current;
      }
    },
    goTop() {},
    goDown() {},
  },
});
