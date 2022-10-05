# diffusion-ui

This is a web interface frontend for the generation of images using diffusion models.

The goal is to provide an interface to online and offline backends doing image generation
and inpainting like [Stable Diffusion](https://github.com/CompVis/stable-diffusion).

<p align="center">
  <img src="https://github.com/leszekhanusz/diffusion-ui/blob/main/doc/cute_bunny.gif" />
</p>

## Documentation

The documentation is available [here](https://diffusionui.readthedocs.io)

## Technologies

Diffusion UI was made using:

* [Vue 3](https://vuejs.org/) with [Pinia](https://pinia.vuejs.org/)
* [PrimeVue components](https://www.primefaces.org/primevue/)
* [Fabric.js](http://fabricjs.com/)
* [The Pug templating language](https://pugjs.org)
* [Font Awesome icons](https://fontawesome.com/)

## Features

* Text-to-image
* Image-to-Image:
    * from an uploaded image
    * from a drawing made on the interface
* Inpainting
    * Including the possibility to draw inside an inpainting region
* Modular support for different backends:
    * a basic Stable Diffusion backend
    * the full-featured automatic1111 fork
    * the online free Stable Horde
* Modification of model parameters in left tab
* Image gallery of previous image in the right tab
* Allow to do variations and inpainting edits to previously generated images
* [Share the backend on your PC](https://diffusionui.readthedocs.io/en/latest/backends/stable-diffusion.html#sharing) to use it on your smartphone or tablet

## Frontend

The frontend is available at [diffusionui.com](http://diffusionui.com)
(**Note:** You still need to have a local backend to make if work with Stable diffusion)

Or alternatively you can [run it locally](https://diffusionui.readthedocs.io/en/latest/frontend.html).

## Backends

### Stable Diffusion local backend

To install the Stable Diffusion backend, follow the instructions [in the docs](https://diffusionui.readthedocs.io/en/latest/backends/stable-diffusion.html)

### Automatic1111 Stable Diffusion local backend

To use Automatic1111 fork of Stable Diffusion, follow the instructions [here](https://diffusionui.readthedocs.io/en/latest/backends/automatic1111.html)

### Automatic1111 Stable Diffusion Colab backend

To run Automatic1111 fork of Stable Diffusion on Google Colab and use it as the backend, run [the diffusionui_with_colab_backend notebook](diffusionui_with_colab_backend.ipynb) in this repo.

### Stable Horde online backend

To generate images for free using the Stable Horde, follow the instructions [here](https://diffusionui.readthedocs.io/en/latest/backends/stable-horde.html)

## License
[MIT License](https://github.com/leszekhanusz/diffusion-ui/blob/main/LICENSE) for the code here.

[CreativeML Open RAIL-M license](https://huggingface.co/spaces/CompVis/stable-diffusion-license)
for the Stable Diffusion model.
