import { defineStore } from "pinia";

export const usePromptStore = defineStore({
  id: "prompt",
  state: () => ({
    prompt: "Dark Vador playing the guitar in a field",
    url: "https://huggingface.co/gradioiframe/multimodalart/latentdiffusion/api/predict/",
    loading: false,
    width: 256,
    height: 256,
    nb_steps: 50,
    nb_images: 1,
    diversity_scale: 15.0,
    image_b64: null,
  }),
  getters: {},
  actions: {
    run() {
      alert(this.prompt);
    },
    async generateImage() {
      try {
        console.log("Generate image from prompt: '" + this.prompt + "'");
        this.loading = true;
        const response = await fetch(this.url, {
          method: "POST",
          body: JSON.stringify({
            data: [
              this.prompt,
              this.nb_steps,
              this.width,
              this.height,
              this.nb_images,
              this.diversity_scale,
            ],
          }),
          headers: { "Content-Type": "application/json" },
        });

        const json_result = await response.json();

        const data_image = json_result["data"][0];

        console.log("Image received!");

        this.$patch({
          image_b64: data_image,
        });
      } catch (error) {
        console.error(error);
      }
      this.loading = false;
    },
  },
});
