import { QuartzFilterPlugin } from "../types"

export const RemoveDrafts: QuartzFilterPlugin<{}> = () => ({
  name: "RemoveDrafts",
  shouldPublish(_ctx, [_tree, vfile]) {
    // Check if we should include drafts (for local development)
    const includeDrafts = process.env.QUARTZ_INCLUDE_DRAFTS === "true"
    
    if (includeDrafts) {
      return true // Include all content including drafts
    }
    
    const draftFlag: boolean =
      vfile.data?.frontmatter?.draft === true || vfile.data?.frontmatter?.draft === "true"
    return !draftFlag
  },
})
