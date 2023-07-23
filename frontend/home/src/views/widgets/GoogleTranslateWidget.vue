<template>
  <div id="google_translate_element" class="d-none"></div>
</template>

<script setup lang="ts">
const onLoadScript = ref()
const mySelect = ref()

const googleSelect = '.goog-te-combo'

window.googleTranslateElementInit = () => {
  new window.google.translate.TranslateElement(
    { pageLanguage: 'en' },
    'google_translate_element'
  )

  onLoadScript.value = setInterval(() => {
    if (document.querySelector(`${googleSelect} option`)) {
      document.querySelector(
        '.skiptranslate.goog-te-gadget'
      )!.childNodes[1].textContent = ''

      const event = new Event('change')
      window.$(`${googleSelect}`).on('select2:select', () => {
        document.querySelector(`${googleSelect}`)!.dispatchEvent(event)
      })

      //   select 2
      mySelect.value = window.$(`${googleSelect}`).select2({
        minimumResultsForSearch: Infinity,
        theme: 'default filter__select2',
      })

      mySelect.value.data('select2').$dropdown.addClass('skiptranslate')

      clearTimeout(onLoadScript.value)
    }
  }, 100)
}
onMounted(() => {
  if (window.$(`${googleSelect}`).data('select2')) {
    return
  }
  ;(function () {
    let gtConstEvalStartTime: any = new Date()
    if (window._isNS('google.translate.Element')) {
      return
    }

    ;(function () {
      const c = window._setupNS('google.translate._const')

      c._cest = gtConstEvalStartTime
      gtConstEvalStartTime = undefined // hide this eval start time constant
      c._cl = 'en-GB'
      c._cuc = 'googleTranslateElementInit'
      c._cac = ''
      c._cam = ''
      c._ctkk = '464523.3327969838'
      const h = 'translate.googleapis.com'
      const oph = 'translate-pa.googleapis.com'
      const s = 'https' + '://'
      c._pah = h
      c._pas = s
      const b = s + 'translate.googleapis.com'
      const staticPath = '/translate_static/'
      c._pci = b + staticPath + 'img/te_ctrl3.gif'
      c._pmi = b + staticPath + 'img/mini_google.png'
      c._pbi = b + staticPath + 'img/te_bk.gif'
      c._pli = b + staticPath + 'img/loading.gif'
      c._ps = b + staticPath + 'css\/translateelement.css'
      c._plla = oph + '\/v1\/supportedLanguages'
      c._puh = 'translate.google.com'
      c._cnal = {}
      window._loadCss(c._ps)
      window._loadJs(
        'https:\/\/translate.googleapis.com\/_\/translate_http\/_\/js\/k\x3dtranslate_http.tr.en_GB.I_n1hHNKRQg.O\/d\x3d1\/exm\x3del_conf\/ed\x3d1\/rs\x3dAN8SPfq1BaON9PeD_0qd-QgiiAO9yry5vg\/m\x3del_main'
      )
      window._exportMessages()
      window._exportVersion('TE_20221207')
    })()
  })()

  setTimeout(() => {
    window.$(`#google_translate_element`).removeClass('d-none')
  }, 3000)
})

onUnmounted(() => {
  mySelect.value?.select2('destroy')
  clearTimeout(onLoadScript.value)
})
</script>

<style>
.goog-logo-link,
.goog-te-banner-frame.skiptranslate {
  display: none !important;
}

#google_translate_element select {
  border: 0 !important;
  clip: rect(0 0 0 0) !important;
  -webkit-clip-path: inset(50%) !important;
  clip-path: inset(50%) !important;
  height: 1px !important;
  overflow: hidden !important;
  padding: 0 !important;
  position: absolute !important;
  width: 1px !important;
  white-space: nowrap !important;
  padding: 0;
  margin: 0;
  border-radius: 0;
  -webkit-appearance: none;
  -moz-appearance: none;
  -ms-appearance: none;
  appearance: none;
  box-shadow: none;
  transition: 0.5s ease;
  transition-property: background-color, border-color;
}
#google_translate_element select {
  word-wrap: normal;
}
#google_translate_element select {
  text-transform: none;
}
#google_translate_element select {
  margin: 0;
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
}
</style>
