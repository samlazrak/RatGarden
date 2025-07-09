import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  afterBody: [
    Component.ConditionalRender({
      component: Component.TwoColumnNotes({
        title: "Random Notes",
        limit: 5,
        showTags: true,
      }),
      condition: (page) => page.fileData.slug === "index",
    }),
    Component.TagList(),
  ],
  footer: Component.Footer({
    links: {
      "Main Website": "https://samlazrak.github.io/",
      GitHub: "https://github.com/samlazrak",
      LinkedIn: "https://www.linkedin.com/in/samlazrak",
    },
  }),
}

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.ConditionalRender({
      component: Component.Breadcrumbs(),
      condition: (page) => page.fileData.slug !== "index",
    }),
  ],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        {
          Component: Component.Search(),
          grow: true,
        },
        { Component: Component.Darkmode() },
        { Component: Component.ReaderMode() },
      ],
    }),
    Component.Explorer({
      title: "Explorer",
      folderClickBehavior: "link",
      folderDefaultState: "collapsed",
      useSavedState: true,
      mapFn: (node) => node,
      sortFn: (a, b) => {
        // folders first, then files, both alphabetically
        if ((!a.file && !b.file) || (a.file && b.file)) {
          return a.displayName.localeCompare(b.displayName, undefined, { numeric: true, sensitivity: 'base' })
        }
        if (a.file && !b.file) {
          return 1
        } else {
          return -1
        }
      },
      filterFn: (node) => node.name !== "tags",
    }),
    Component.DesktopOnly(Component.TableOfContents()),
  ],
  right: [
    Component.ConditionalRender({
      component: Component.Graph(),
      condition: (page) => page.fileData.slug === "index",
    }),
    Component.ConditionalRender({
      component: Component.RecentNotes({
        title: "Recent Notes",
        limit: 5,
      }),
      condition: (page) => page.fileData.slug === "index",
    }),
    Component.ConditionalRender({
      component: Component.Graph(),
      condition: (page) => page.fileData.slug !== "index",
    }),
    Component.ConditionalRender({
      component: Component.SemanticLinks({
        title: "Related Content",
        maxSuggestions: 5,
        minStrength: 0.1,
        showStrength: true,
        showConfidence: false,
        showExplanation: true,
      }),
      condition: (page) => page.fileData.slug !== "index",
    }),
    Component.Backlinks(),
  ],
}

// components for pages that display lists of pages  (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
  beforeBody: [Component.Breadcrumbs(), Component.ArticleTitle()],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        {
          Component: Component.Search(),
          grow: true,
        },
        { Component: Component.Darkmode() },
      ],
    }),
    Component.Explorer(),
  ],
  right: [],
}
