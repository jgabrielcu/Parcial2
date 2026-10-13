const onxrloaded = () => {
  XR8.XrController.configure({
    imageTargetData: [
      require('../image-targets/Colibri.json'),
      require('../image-targets/Garza.json'),
      require('../image-targets/Guacamaya.json'),
      require('../image-targets/Paloma.json')
    ],
  })
  //XR8.addCameraPipelineModule(LandingPage.pipelineModule())
}
window.XR8 ? onxrloaded() : window.addEventListener('xrloaded', onxrloaded)

