# diffusion-ui

This is a web interface frontend for the generation of images using diffusion models.

The goal is to provide an interface to online and offline backends doing image generation
and inpainting like [Stable Diffusion](https://github.com/CompVis/stable-diffusion).

<p align="center">
  <img src="https://github.com/leszekhanusz/diffusion-ui/blob/main/doc/cute_bunny.gif" />
</p>

It was made using:

* [Vue 3](https://vuejs.org/) with [Pinia](https://pinia.vuejs.org/)
* [PrimeVue components](https://www.primefaces.org/primevue/)
* [Fabric.js](http://fabricjs.com/)
* [The Pug templating language](https://pugjs.org)
* [Font Awesome icons](https://fontawesome.com/)

THIS IS STILL A WORK IN PROGRESS!

TODO:

* Using localStorage to save generated pictures and configuration options
* Allow to add custom backends saved to localStorage using a json file
* Zoom out functionality
* Support image sizes different than 512x512
* Allow to work on specific parts of an image, outpainting
* ...

## Frontend

The frontend is available at [diffusionui.com](http://diffusionui.com)
(**Note:** You still need to have a local backend to make if work with Stable diffusion)

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

To install the Stable Diffusion backend, follow the instructions [here](https://github.com/leszekhanusz/diffusion-ui-backend)

## License
[MIT License](https://github.com/leszekhanusz/diffusion-ui/blob/main/LICENSE) for the code here.

[CreativeML Open RAIL-M license](https://huggingface.co/spaces/CompVis/stable-diffusion-license)
for the Stable Diffusion model.
