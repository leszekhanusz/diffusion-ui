# diffusion-ui

This is a web interface frontend for generation of images using the
[Automatic1111 fork](https://github.com/AUTOMATIC1111/stable-diffusion-webui) of
[Stable Diffusion](https://github.com/CompVis/stable-diffusion).

<p align="center">
  <img src="https://github.com/leszekhanusz/diffusion-ui/blob/main/doc/cute_bunny.gif" />
</p>

<p align="center">
  <img src="https://github.com/leszekhanusz/diffusion-ui/blob/main/doc/automatic1111_fullscreen.png" style="width: 100%"/>
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
* Outpainting (using mouse to scroll out)
* Modification of model parameters in left tab
* Image gallery of previous image in the right tab
* Allow to do variations and inpainting edits to previously generated images

## Tips

* Use the mouse wheel to zoom in or zoom out in a provided image
* Use the shift key to make straight lines for drawing or for making inpainting zones
* Use Control-z to cancel an action in the image editor
* Use the arrow keys (left,right,up and down) to move inside the image gallery.
  The Home key will allow you to go back to the first image of the batch.

## Frontend

The frontend is available at [diffusionui.com](http://diffusionui.com)
(**Note:** You still need to have a local backend to make it work with Stable diffusion)

Or alternatively you can [run it locally](https://diffusionui.readthedocs.io/en/latest/frontend.html).

## Backends

### Automatic1111 Stable Diffusion

#### local backend

To be able to connect diffusion-ui to the Automatic1111 fork of Stable Diffusion from your own pc, you need to
run it with the following parameters: `--cors-allow-origins=http://localhost:5173,https://diffusionui.com`.

See the instructions [here](https://diffusionui.readthedocs.io/en/latest/backends/automatic1111.html).

#### online colab backend

If you can't run it locally, it is also possible to use the automatic1111 fork of Stable Diffusion with diffusion-ui online for free with this [Google Colab notebook](https://colab.research.google.com/github/leszekhanusz/diffusion-ui/blob/main/src/backends/colab/automatic1111.ipynb)

## License
[MIT License](https://github.com/leszekhanusz/diffusion-ui/blob/main/LICENSE) for the code here.

[CreativeML Open RAIL-M license](https://huggingface.co/spaces/CompVis/stable-diffusion-license)
for the Stable Diffusion model.
