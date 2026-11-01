import type { Section } from '../types'

export const aPrivateEndpoint: Section = {
  id: 'a-private-endpoint',
  title: 'A private endpoint: the lake gets an address inside the network',
  scene: 'network-private-endpoint',
  narration:
    "The lake has no public door now, so the pipeline needs a private one, and this detour follows a request through it. Everything in this frame was recorded on Azure. The Terraform on the right creates a private endpoint for each of the lake's two interfaces, blob and D F S, in the private endpoints subnet, and a private D N S zone for each. Six resources in all, created by the apply. On the left is the path. Something inside the V Net asks for the lake by its usual name, s t tradefin dev dot blob dot core dot windows dot net, the very same name the laptop used. Because the V Net is linked to the private D N S zone, privatelink dot blob dot core dot windows dot net, that name resolves to a private address, ten dot thirty dot one dot four. The terminal shows that record, read straight from the zone. That address belongs to the private endpoint, a network interface sitting in the subnet, and through it the request reaches the storage account over Microsoft's network, never the internet. Nothing in the pipeline's code changes: it uses the same name, and the network decides where that name leads. From outside the V Net, the same name still points at the public endpoint, which refuses. Next, the other side of the pipeline: why TradeBook is out of reach.",
}
