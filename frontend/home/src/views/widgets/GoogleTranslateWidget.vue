<template>
  <div id="google_translate_element" class="d-none"></div>
</template>

<script setup lang="ts">
const onLoadScript = ref()
const mySelect = ref()
const loopMade = ref(0)

const googleSelect = '.goog-te-combo'

window.googleTranslateElementInit = () => {
  new window.google.translate.TranslateElement(
    { pageLanguage: 'en' },
    'google_translate_element'
  )

  onLoadScript.value = setInterval(() => {
    if (loopMade.value > 600) clearTimeout(onLoadScript.value)
    loopMade.value++
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

  window.initGoogleTranslate()

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

.skiptranslate.goog-te-gadget > span {
  display: none;
}

/* hidden header  */
body > div.skiptranslate {
  display: none;
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
