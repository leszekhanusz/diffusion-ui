# diffusion-ui

This is a web interface frontend for the generation of images using diffusion models.

The goal is to provide an interface to online and offline backends doing image generation
and inpainting like [Stable Diffusion](https://github.com/CompVis/stable-diffusion).

It was made using:

* [Vue 3](https://vuejs.org/) with [Pinia](https://pinia.vuejs.org/)
* [PrimeVue components](https://www.primefaces.org/primevue/)
* [Fabric.js](http://fabricjs.com/)
* [The Pug templating language](https://pugjs.org)
* [Font Awesome icons](https://fontawesome.com/)

THIS IS STILL A WORK IN PROGRESS!

TODO:

* undo/redo mask drawing
* change brush size
* Saving generated images in a gallery in a panel to the right
* Using localStorage to save generated pictures and configuration options
* Drawing option to draw inside the masked area
* Allow to add custom backends saved to localStorage using a json file
* Zoom out functionality
* Support image sizes different than 512x512
* Allow to work on specific parts of an image, outpainting
* ...

## Frontend

The frontend is available at [diffusionui.com](http://diffusionui.com).

Or alternatively you can run it locally.

### Frontend Installation

Install [node.js](https://nodejs.org/en/download/), clone this repo and run:

```bash
npm install
```

### Frontent running locally

Execute the following line on the terminal to get a local link:

```bash
npm run dev
```

## Stable Diffusion local backend

To be able to run the Stable Diffusion backend on your computer:

### Installation

Install the latest version of [diffusers](https://github.com/huggingface/diffusers) and
follow [the instructions](https://github.com/huggingface/diffusers#text-to-image-generation-with-stable-diffusion)
to download the model and create an image.

Install gradio:

```bash
pip install gradio
```

then run this [script](https://github.com/leszekhanusz/diffusers/blob/feature_unified_stable_diffusion_pipeline/examples/inference/unified_gradio.py)
to provide a gradio interface to an unified pipeline for Stable Diffusion
(doing text-to-image, image-to-image, and inpainting with the same backend).

## License
[MIT License](https://github.com/leszekhanusz/diffusion-ui/blob/main/LICENSE) for the code here.

[CreativeML Open RAIL-M license](https://huggingface.co/spaces/CompVis/stable-diffusion-license)
for the Stable Diffusion model.
