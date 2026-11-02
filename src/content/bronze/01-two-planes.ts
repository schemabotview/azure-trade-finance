import type { Section } from '../types'

export const twoPlanes: Section = {
  id: 'two-planes',
  title: 'Databricks’ two planes',
  scene: 'bronze-two-planes',
  narration:
    "Databricks splits itself in two, and where each half runs decides what the bank has to trust. This film does not deploy Databricks, as the label says: the Terraform on screen is validated, and the Spark that later courses run is open source, on Ana's laptop, which is what a Databricks cluster runs. The frame draws the two planes. The control plane runs in Databricks' own Azure subscription: the workspace's web application and A P I, the jobs service, Unity Catalog, and the cluster manager that starts and stops machines. The compute plane is where the data is actually processed, and it runs in our subscription. The cluster's virtual machines are injected into the virtual network from Course six, into the two subnets set aside for Databricks then, with no public addresses, and they reach the lake through its private endpoint. The editor shows the workspace in Terraform: the premium tier, which Unity Catalog needs, and the highlighted lines that make it private, no public I P and our own virtual network. The lab also adds what that requires: the two subnets are delegated to Databricks, and each gets a network security group. The terminal shows the configuration validated, with the Databricks provider pinned beside azure R M. The point of the split is the arrow in the middle: Databricks' service tells our machines when to start and stop, but the letters of credit never leave our subscription. Next, the D B U, the unit Databricks charges in.",
}
