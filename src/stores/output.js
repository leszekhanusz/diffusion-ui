import { defineStore } from "pinia";
import { nextTick } from "vue";

export const useOutputStore = defineStore({
  id: "output",
  state: () => ({
    loading: false,
    loading_progress: null,
    loading_message: null,
    request_uuid: null,
    image_index: {
      current: 0,
      saved: 0,
    },
    gallery: [],
    gallery_index: 0,
    error_message: null,
  }),
  getters: {
    nb_images: (state) => state.images?.content.length,
    nb_gallery: (state) => state.gallery.length,
    images: (state) => state.gallery[state.gallery_index],
    gallery_images: function (state) {
      return state.images?.content.map(function (image, idx) {
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
    async restoreImageIndex() {
      const saved = this.image_index.saved;
      if (saved >= this.nb_images) {
        this.image_index.current = this.nb_images - 1;
      } else {
        this.image_index.current = this.image_index.saved;
      }
      console.log(`Saved restored to ${saved}`);
      await nextTick();
      this.image_index.saved = saved;
    },
    goUp() {
      if (this.gallery_index > 0) {
        this.gallery_index--;
        this.restoreImageIndex();
      }
    },
    goDown() {
      if (this.gallery_index < this.nb_gallery - 1) {
        this.gallery_index++;
        this.restoreImageIndex();
      }
    },
    goToFirst() {
      this.image_index.current = 0;
    },
    imageIndexUpdated() {
      this.image_index.saved = this.image_index.current;
    },
    onKeyUp(e) {
      switch (e.key) {
        case "ArrowDown":
          this.goDown();
          e.preventDefault();
          break;
        case "ArrowUp":
          this.goUp();
          e.preventDefault();
          break;
        case "ArrowLeft":
          this.goLeft();
          e.preventDefault();
          break;
        case "ArrowRight":
          this.goRight();
          e.preventDefault();
          break;
        case "Home":
          this.goToFirst();
          e.preventDefault();
          break;
      }
    },
  },
});
