import jsdom from 'jsdom'

export default class ParseString {
  public static clearHtml(body: string): string {
    const dom = new jsdom.JSDOM(body)
    const links = dom.window.document.querySelectorAll('a[data-link-replace]')
    links.forEach((link) => {
      const linkText = link.getAttribute('data-link-replace') || ''
      link.innerHTML = linkText
      link.removeAttribute('href')
    })
    const text = dom.window.document.documentElement.textContent

    return text || ''
  }
}
