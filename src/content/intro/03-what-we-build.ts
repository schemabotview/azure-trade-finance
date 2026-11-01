import type { Section } from '../types'

export const whatWeBuild: Section = {
  id: 'what-we-build',
  title: 'What we will build',
  scene: 'intro-what-we-build',
  narration:
    "This is the map of what we will build, with every part lit. It will appear again and again, with only the parts built so far lit up. On the left is Syndica Bank's own network. TradeBook, the trade finance system, is a PostgreSQL database there, and the desk that reads the answer sits beside it. On the right is an Azure subscription, with one resource group. A storage account holds the lake, in zones: landing, where each night's extract arrives, then Bronze, Silver and Gold, and the risk team's reference files. Between the zones are the gates, G one to G four, which decide whether data moves on. Beside the lake, a virtual network keeps everything private, and a runtime inside the bank carries the data out. Data Factory moves the data; Databricks turns it into Gold; Key Vault keeps the secrets; and a budget, a policy and alerts watch over the subscription. The side pane shows where it ends: Woodgrove, in dollars, nine point seven million against a limit of ten million, ninety seven percent used, three hundred thousand dollars of headroom. And it shows the order of the twelve courses. A few promises about how this is made. Every Azure resource is written in Terraform. Every output on screen was really run, either locally or recorded once on a real subscription, and each frame says which. And the subscription is emptied after every course. Next, before any of it, how Azure itself is built.",
}
