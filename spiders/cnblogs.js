const BaseSpider = require('./base')
const constants = require('../constants')

class CnblogsSpider extends BaseSpider {

  // async inputContent(article, editorSel) {
  //   const footerContent = `<br><b>本篇文章由一文多发平台<a href="https://github.com/crawlab-team/artipub" target="_blank">ArtiPub</a>自动发布</b>`
  //   const content = article.contentHtml + footerContent;
  //   const iframeWindow = document.querySelector('#Editor_Edit_EditorBody_ifr').contentWindow
  //   const el = iframeWindow.document.querySelector(editorSel.content)
  //   el.focus()
  //   iframeWindow.document.execCommand('delete', false)
  //   iframeWindow.document.execCommand('insertHTML', false, content)
  // }

  async inputFooter(article, editorSel) {
    // do nothing
  }

  async afterPublish() {
    this.task.url = await this.page.evaluate(() => {
      return document.querySelector('.link-post-title')
        .getAttribute('href')
    })
    console.log(this.task.url)
    if (!this.task.url) return
    this.task.updateTs = new Date()
    this.task.status = constants.status.FINISHED
    await this.task.save()
  }

  async fetchStats() {
    if (!this.task.url) return
    await this.page.goto(this.task.url, { timeout: 60000 })
    await this.page.waitFor(5000)

    const stats = await this.page.evaluate(() => {
      const text = document.querySelector('body').innerText
      const mRead = text.match(/阅读 \((\d+)\)/)
      const mLike = document.querySelector('#bury_count').innerText
      const mComment = text.match(/评论 \((\d+)\)/)
      const readNum = mRead ? Number(mRead[1]) : 0
      const likeNum = Number(mLike)
      const commentNum = mComment ? Number(mComment[1]) : 0
      return {
        readNum,
        likeNum,
        commentNum
      }
    })
    this.task.readNum = stats.readNum
    this.task.likeNum = stats.likeNum
    this.task.commentNum = stats.commentNum
    await this.task.save()
    await this.page.waitFor(3000)
  }
}

module.exports = CnblogsSpider
